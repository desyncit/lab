# -*- coding: utf-8 -*-
from __future__ import (absolute_import, division, print_function)
__metaclass__ = type

import re
import os.path
import socket

DOCUMENTATION = r'''
---
module: queue_manager

short_description: Basic functions of an ibm mq cluster
version_added: "1.0.0"
options:
  qmname:
    description: 
      - name of queue manager
    required: true 
    type: str
  description:
    description:
      - Add description to queue manager
    required: false
    type: str
  mqsc_file: 
    description: 
      - Absolute pathname to mqsc_file
    required: false
    type: str
  state:
    description: 
      - status returns the state of the a queuemanager
      - started starts a queuemanager
      - stopped stops a queuemanager
      - absent deletes a quuemanager, requires var
        yes_i_really_really_mean_it to be defined and 
        set to true.
    required: false
    type: str
  yes_i_really_really_mean_it:
    description:
      - Set to delete a queuemanager
      - Only required if state=absent
    required: false
    type: bool
'''

EXAMPLES = r'''
- name: Check the status of a queue manager
  queue_manager:
    qmname: QM1
    state: status

- name: Start a stopped queue manager
  queue_manager:
    qmname: QM_DEV
    state: started

- name: Stop a running queue manager immediately
  queue_manager:
    qmname: QM_PROD
    state: stopped

- name: Delete a queue manager (requires safety flag)
  queue_manager:
    qmname: QM_OLD
    state: absent
    yes_i_really_really_mean_it: true
'''

RETURN = r'''
changed:
  description: Indicates if the queue manager's state was modified by the module.
  returned: always
  type: bool
  sample: true
msg:
  description: A human-readable message describing the outcome of the action.
  returned: when state is started, stopped, or absent
  type: str
  sample: "Queue Manager QM1 started successfully."
stdout:
  description: A formatted, multiline string containing the queue manager's status.
  returned: when state is status
  type: str
  sample: "Host: node01\nQueueManager: QM1.\nState: Running\nListener: OK\n"
stdout_lines:
  description: The stdout returned as a list of strings, useful for iterating.
  returned: when state is status
  type: list
  sample: 
    - "Host: node01"
    - "QueueManager: QM1."
    - "State: Running"
    - "Listener: OK"
status:
  description: A dictionary containing structured status data for the queried queue manager.
  returned: when state is status
  type: dict
  sample: 
    QM1:
      host: "node01"
      qm_name: "QM1"
      qm_running: true
      listener_running: true
'''
from ansible.module_utils.basic import AnsibleModule

result = dict(
    rc=0,
    stdout='',
    stderr='',
    stdout_lines=[],
    changed=False
)
def mq_environment():
    mq_paths = ["/opt/mqm/bin", "/opt/mqm/samp/bin"]
    current_path = os.environ.get('PATH', '')
    np = [p for p in mq_paths if p not in current_path]
    if np:
        os.environ['PATH'] = ":".join(np + [current_path])
    
    current_libs = os.environ.get('LD_LIBRARY_PATH', '')
    mq_libs = "/opt/mqm/lib64:/opt/mqm/lib"

    if mq_libs not in current_libs:
        os.environ['LD_LIBRARY_PATH'] = f"{mq_libs}:{current_libs}".strip(':')


def command_crtmqm(qmname, module):
    args = ['crtmqm', qmname]
    if module.params.get('description'):
        args.extend(['-c', module.params['description']])

    args.append(qmname)

    if module.check_mode:
        return {"changed": True, "msg": f"Queue manager {qmname} would be created."}
     
    rc, stdout, stderr = module.run_command(args)
     
    if rc == 0:
       return {"changed": True, "msg": f"Queue manager {qmname} created successfully."}
    if rc == 12:
        return {"changed": False, "msg": f"Queue manager {qmname} already exists."}

    CRTMQM_ERRORS = {
        16: "Unexpected internal error (check /var/mqm/errors).",
        36: "Storage limits exceeded.",
        40: "Maximum number of queue managers reached.",
        71: "Operating system error (check permissions).",
        72: "Invalid Queue Manager name."
    }
    error_hint = CRTMQM_ERRORS.get(rc, "Unknown error")
    module.fail_json(
        msg=f"Failed to create {qmname}: {error_hint}",
        rc=rc,
        stdout=stdout,
        stderr=stderr
    )

def command_runmqsc(qmname, module, command=None, mqsc_file=None):
    args = ['runmqsc']
    data_input = None

    if module.check_mode:
       args.append('-v')

    if mqsc_file:
       args.extend(['-f', mqsc_file])
    elif command:
       data_input = command

    args.append(qmname)

    rc, stdout, stderr = module.run_command(args, data=data_input)

    if rc == 10:
       return {"changed": True, "msg": "AMQ8420I: Channel Status not found"}
       
    if rc != 0:
       error_hints = {
          20:  "AMQ7027E: Argument supplied to command runmqsc is invalid",
          127: "ENOENT: runmqsc binary not found in PATH"
       }
       hint = error_hints.get(rc, "See stderr for details")
       module.fail_json(
            msg=f"MQSC execution failed for {qmname}",
            rc=rc,
            stderr=stdout,
            hint=hint
        )
    return stdout, rc

def command_dsmq(qmname, module):
    args = ['dspmq']
    args.append('-m')
    args.append(qmname)

    rc, stdout, stderr = module.run_command(args)

    if rc != 0:
       DSPMQ_ERRORS = {
         10: "No queue managers found or partially displayed",
         20: "Critical MQ system error or permission denied",
         72: "Queue manager does not exist on this host",
         127: "ENOENT: The 'dspmq' binary was not found in the system PATH"
       }
       hint = DSPMQ_ERRORS.get(rc, "See stderr for details")
       module.fail_json(
            msg=f"MQSC execution failed for {qmname}",
            rc=rc,    
            stderr=stdout,
            hint=hint 
       )

    target_state = module.params.get('state')
    dqueue = module.params.get('yes_i_really_really_mean_it')

    if target_state == 'status':
       if stdout and 'STATUS(Ended' in stdout:
          if not dqueue:
             module.fail_json(
                 msg=f"Queue Manager {qmname} is in an Ended state.",
                 rc=rc,
                 stderr=stdout,
                 hint="Check /var/mqm/errors/AMQERR01.LOG."
             )
    return bool(stdout and 'STATUS(Running)' in stdout)

def command_strmqm(qmname, module):
    args = ['strmqm']
    args.append(qmname)
    if module.check_mode:
        return {"changed": True, "msg": f"Queue Manager {qmname} would be started."}    
    if command_dsmq(qmname, module):
       return {"changed": False, "msg": f"Queue Manager {qmname} is already running."}

    rc, stdout, stderr = module.run_command(args)

    if rc == 0:
        return {"changed": True, "msg": f"Queue Manager {qmname} started successfully."}    
    if rc == 5:
        return {"changed": False, "msg": f"Queue Manager {qmname} is already running."}

    STRMQM_ERRORS = {
        16: "An unexpected error occurred. Check system error logs.",
        71: "Authentication error or missing permissions to start QM.",
        72: "Queue Manager name is invalid or not found."
    }
    error_hint = STRMQM_ERRORS.get(rc, "See stderr for details")
    module.fail_json(
        msg=f"Failed to start {qmname}: {error_hint}",
        rc=rc,
        stderr=stdout
    )

def command_endmqm(qmname, module):
    args = ['endmqm']
    args.append('-i')
    args.append(qmname)

    if module.check_mode:
        return {"changed": True, "msg": f"Queue Manager {qmname} would be stopped immediately."}

    rc, stdout, stderr = module.run_command(args)
    if rc == 0:
        return {"changed": True, "msg": f"Queue Manager {qmname} stopped immediately."} 
    if rc == 40:
        return {"changed": False, "msg": f"Queue Manager {qmname} is already stopping or stopped."}

    ENDMQM_ERRORS = {
        16: "Unexpected error during shutdown. Check /var/mqm/errors.",
        71: "Permission denied (are you in the mqm group?).",
        72: "Queue Manager not found."
    }
    error_hint = ENDMQM_ERRORS.get(rc, "See stderr for details")
    module.fail_json(
        msg=f"Failed to stop {qmname}: {error_hint}",
        rc=rc,
        stderr=stdout
    )

def command_dltmqm(qmname, module):
    args = ['dltmqm']
    args.append('-z')
    args.append(qmname)
 
    if module.check_mode:
        return {"changed": True, "msg": f"Queue Manager {qmname} would be deleted."}
    if module.params.get('_ansible_verbosity', 0) > 2:
       args.remove('-z')

    run_dspmq = command_dsmq(qmname, module)
    if not run_dspmq:
       return {"changed": False, "msg": f"Queue Manager {qmname} does not exist."}

    command_endmqm(qmname, module)

    rc, stdout, stderr = module.run_command(args)

    if rc == 0:
        return {"changed": True, "msg": f"Queue Manager {qmname} deleted."} 
    DLTMQM_ERRORS = {
        16: "Unexpected error. Check if the QM is still running.",
        71: "Permission denied.",
        72: "Queue Manager not found."
    }    
    error_hint = DLTMQM_ERRORS.get(rc, f"See stderr for details")
    module.fail_json(
           msg=f"Deletion failed: {error_hint}", 
           rc=rc, 
           stderr=stdout
    )
def state_status(qmname, module):
    def check_listener_port(host, port, timeout=10):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            return True
        except Exception:
            return False

    qm_state = command_dsmq(qmname, module)
    current_host = socket.gethostname()
    listener_port = module.params.get('listener_port')

    qm_status = {
        'host': current_host,
        'qm_name': qmname,
        'qm_running': qm_state,
        'listener_running': False,
        'socket_polled': False
    }
    if qm_state:
        qm_status['listener_running'] = check_listener_port(current_host, listener_port)
        qm_status['socket_polled'] = True
    else:
        qm_status['listener_running'] = True
        qm_status['socket_polled'] = False

    msg = (
       f"Host: {current_host}\n"
       f"QueueManager: {qmname}.\n"
       f"State: {'Running' if qm_state else 'Stopped'}\n"
       f"Listener: {'OK' if qm_state else 'DOWN'}\n"
       f"Socket Polled: {'Yes' if qm_status['socket_polled'] else 'No'}" 
    )
    return {
       "changed": False,
       "stdout": msg,
       "stdout_lines": msg.splitlines(),
       "status": {qmname: qm_status}
    }

def state_started(qmname, module):
    return command_strmqm(qmname, module)

def state_stopped(qmname, module):
    return command_endmqm(qmname, module)

def state_absent(qmname, module): 
    return command_dltmqm(qmname, module)

def run_module():
    mq_environment()
    ops = {
        "status": state_status,
        "present": state_started,
        "started": state_started,
        "stopped": state_stopped,
        "absent": state_absent
    }
    qmgr_attributes = dict(
        qmname=dict(
                     type='str', 
                     required=True, 
                     max_len=48
        ),
        description=dict(
                     type='str', 
                     required=False
        ),
        listener_port=dict(
                      type='int', 
                      required=False
        ),
        mqsc_file=dict(
                     type='str', 
                     required=False
        ),
        state=dict(
                     type='str', 
                     required=True,
                     choices=list(ops.keys())
        ),
        yes_i_really_really_mean_it=dict(
                     type='bool', 
                     default=False
        ),
    )
    module = AnsibleModule(
        argument_spec=qmgr_attributes,
        supports_check_mode=True
    )

    qmnames = module.params['qmname']
    if isinstance(qmnames, str):
       qmnames = [qmnames]

    target_state = module.params['state']
    confirmation = module.params.get('yes_i_really_really_mean_it')

    if target_state == 'absent':
        if not confirmation:
            module.fail_json(
               rc=90,
               msg="yes_i_really_really_mean_it' must be True to delete a QM."
            )
    if target_state in ops:
        for qm in qmnames:
            action_result = ops[target_state](qm, module)
            if action_result:
               result.update(action_result)
        module.exit_json(**result)
    else:
         module.fail_json(
                rc=16,
                msg=f"Unsupported state"
         )

if __name__ == '__main__':
    run_module()
