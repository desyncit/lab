# -*- coding: utf-8 -*-
from __future__ import (absolute_import, division, print_function)
__metaclass__ = type

import re
import os.path
import socket
import time

DOCUMENTATION = r'''
---
module: queue_manager

short_description: Basic functions of an ibm mq cluster
version_added: "1.0.0"
options:
  qmname:
    description: 
      - Name of the queue manager.
      - The maximum length allowed is 48 characters.
    required: true 
    type: str
  description:
    description:
      - Add a description to the queue manager.
      - Primarily used when creating a new queue manager.
    required: false
    type: str
  listener_port:
    description:
      - Port number used to poll and check if the queue manager listener is running.
      - This is only utilized when C(state=status).
    required: false
    type: int
  mqsc_file: 
    description: 
      - Absolute pathname to an mqsc_file to execute.
    required: false
    type: str
  state:
    description: 
      - C(status) returns the state of the queue manager.
      - C(started) starts a queue manager.
      - C(stopped) stops a queue manager immediately.
      - C(absent) deletes a queue manager. Requires the variable C(yes_i_really_really_mean_it) to be defined and set to true.
    required: true
    type: str
    choices: [ status, started, stopped, absent ]
  yes_i_really_really_mean_it:
    description:
      - Safety flag required to delete a queue manager.
      - Only checked if C(state=absent).
    required: false
    type: bool
    default: false
'''

EXAMPLES = r'''
- name: Check the status of a queue manager and poll its listener port
  queue_manager:
    qmname: QM1
    state: status
    listener_port: 1414

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
  sample: "Host: node01\nQueueManager: QM1.\nState: Running\nListener: OK\nSocket Polled: Yes"
stdout_lines:
  description: The stdout returned as a list of strings, useful for iterating.
  returned: when state is status
  type: list
  sample: 
    - "Host: node01"
    - "QueueManager: QM1."
    - "State: Running"
    - "Listener: OK"
    - "Socket Polled: Yes"
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
      socket_polled: true
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
    args = ['crtmqm']
    if module.params.get('description'):
        args.extend(['-c', module.params['description']])
    args.append(qmname)

    CRTMQM_ERRORS = {
        16: "Unexpected internal error (check logs).",
        36: "Storage limits exceeded.",
        40: "Maximum number of queue managers reached.",
        71: "Operating system error (check permissions).",
        72: "Invalid Queue Manager name."
    }
    if module.check_mode:
        return {"changed": True, "msg": f"Queue manager {qmname} would be created."}
     
    rc, stdout, stderr = module.run_command(args)
    if rc == 0:
       return {"changed": True, "msg": f"Queue manager {qmname} created successfully."}
    if rc == 12:
        return {"changed": False, "msg": f"Queue manager {qmname} already exists."}

    hint = CRTMQM_ERRORS.get(rc, "Unknown error, (check stderr)")
    module.fail_json(
        msg=f"Failed to create {qmname}",
        rc=rc,
        stdout=stderr,
        hint=hint
    )

def command_runmqsc(qmname, module, command=None, mqsc_file=None):
    args = ['runmqsc']
    data_input = None

    RUNMQSC_ERRORS = {
          20: "Argument supplied to command runmqsc is invalid (AMQ7027E)",
         127: "runmqsc binary not found in PATH (ENOENT)"
    }

    if module.check_mode:
       args.append('-v')
    if mqsc_file:
       args.extend(['-f', mqsc_file])
    elif command:
       data_input = command

    args.append(qmname)
    rc, stdout, stderr = module.run_command(args, data=data_input)

    if rc == 10:
       return {"changed": True, "msg": "Channel Status not found (AMQ8420I)"}

    if rc != 0:
       hint = RUNMQSC_ERRORS.get(rc, "See stderr for details")
       module.fail_json(
            msg=f"Failed to execute runmqsc command on {qmname} (check stderr)",
            rc=rc,
            stderr=stdout,
            hint=hint
        )
    return stdout, rc

def command_dsmq(qmname, module):
    args = ['dspmq']
    args.append('-m')
    args.append(qmname)

    current_host = socket.gethostname()

    DSPMQ_ERRORS = {
      10: "No queue managers found or partially displayed",
      20: "Critical MQ system error or permission denied",
      72: f"Queue manager does not exist on this {current_host}",
      127: "ENOENT: The 'dspmq' binary was not found in the system PATH"
    }

    rc, stdout, stderr = module.run_command(args)
    if rc != 0:
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
             hint = DSPMQ_ERRORS.get(rc, "See stderr for details")
             module.fail_json(
                 msg=f"Queue Manager {qmname} is in an ended state",
                 rc=rc,
                 stderr=stdout,
                 hint=hint
             )
    return bool(stdout and 'STATUS(Running)' in stdout)

def command_strmqm(qmname, module):
    args = ['strmqm']
    args.append(qmname)

    STRMQM_ERRORS = {
        16: "An unexpected error occurred. Check system error logs.",
        71: "Authentication error or missing permissions to start QM.",
        72: "Queue Manager name is invalid or not found."
    }

    if module.check_mode:
        return {"changed": True, "msg": f"Queue Manager {qmname} would be started."}    
    if command_dsmq(qmname, module):
       return {"changed": False, "msg": f"Queue Manager {qmname} is already running."}

    rc, stdout, stderr = module.run_command(args)

    if rc == 0:
        return {"changed": True, "msg": f"Queue Manager {qmname} started successfully."}    
    if rc == 5:
        return {"changed": False, "msg": f"Queue Manager {qmname} is already running."}

    hint = STRMQM_ERRORS.get(rc, "See stderr for details")
    module.fail_json(
        msg=f"Failed to start {qmname}",
        rc=rc,
        stderr=stdout,
        hint=hint
    )

def command_endmqm(qmname, module):
    args = ['endmqm']
    args.append('-c')
    args.append(qmname)
    
    ENDMQM_ERRORS = {
        16: "Unexpected error during shutdown. Check /var/mqm/errors.",
        71: "Permission denied (are you in the mqm group?).",
        72: "Queue Manager not found."
    }
    if module.check_mode:
        return {"changed": True, "msg": f"Queue Manager {qmname} would be stopped immediately."}

    rc, stdout, stderr = module.run_command(args)
    if rc == 0:
        return {"changed": True, "msg": f"Queue Manager {qmname} stopped immediately."} 
    if rc == 40:
        return {"changed": False, "msg": f"Queue Manager {qmname} is already stopping or stopped."}

    hint = ENDMQM_ERRORS.get(rc, "See stderr for details")
    module.fail_json(
        msg=f"Failed to stop {qmname}: {error_hint}",
        rc=rc,
        stderr=stdout,
        hint=hint
    )

def command_dltmqm(qmname, module):
    args = ['dltmqm']
    args.append('-z')
    args.append(qmname)

    DLTMQM_ERRORS = {
        16: "Unexpected error. Check if the QM is still running.",
        71: "Permission denied.",
        72: "Queue Manager not found."
    }

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

    hint = DLTMQM_ERRORS.get(rc, f"See stderr for details")
    module.fail_json(
           msg=f"Deletion failed",
           rc=rc,
           stderr=stdout,
           hint=hint
    )

def state_status(qmname, module):
    def check_listener_port(host, port, timeout):
        if not port:
            return False
          
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except Exception:
            return False


    qm_state = command_dsmq(qmname, module)
    current_host = socket.gethostname()
    
    ''' set socket default'''
    delay = 1
    retries = 1
    timeout = (delay * retries)

    listener_port = module.params.get('listener_port')
    qm_status = {
        'qm_name': qmname,
        'qm_running': qm_state,
        'host': current_host,
        'listener_reachable': False,
        'socket_polled': False
    }
    if qm_state and listener_port:
       qm_status['listener_reachable'] = check_listener_port(
          current_host, 
          listener_port,
          timeout,
       )
       qm_status['socket_polled'] = True
    elif qm_status and not listener_port:
        qm_status['listener_reachable'] = True

    msg = (
       f"Host: {current_host}\n"
       f"QueueManager: {qmname}.\n"
       f"State: {'Running' if qm_state else 'Stopped'}\n"
       f"Listener: {'OK' if qm_status['listener_reachable'] else 'DOWN'}\n"
       f"Socket Polled: {'Yes' if qm_status['socket_polled'] else 'No'}"
    )
    return {
       "changed": False,
       "stdout": qm_status,
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
