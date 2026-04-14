# linux_generic

An Ansible role for performing generic compute, network, and storage tasks on RHEL hosts. Each task group is gated by a top-level variable — only define the groups you need.

---

## Requirements

- Target host must be running Red Hat Enterprise Linux (checked via `ansible_distribution == "RedHat"`)
- `ansible.posix` collection required for storage unmount tasks: `ansible-galaxy collection install ansible.posix`

---

## Task Files

| File | Description |
|---|---|
| `main.yml` | Entry point, gates execution on RHEL and includes task files based on defined variables |
| `checks.yml` | Validates all input variables before any tasks run |
| `compute.yml` | Process filtering and killing via `pgrep` and `pkill` |
| `network.yml` | Socket statistics via `ss` |
| `storage.yml` | Directory listing, file removal, and path unmounting |

---

## Variables

Each task file is only included when its top-level variable is defined. Omit a group entirely to skip it.

### Compute

Define `linux_generic_compute` to include `compute.yml`.

```yaml
linux_generic_compute:
  process_filter: nginx           # required — process name to filter with pgrep
  process_kill: false             # required — enable killing matched processes
  process_kill_signal: '-SIGTERM' # required when process_kill: true
                                  # accepted values: -SIGTERM, -SIGKILL, -SIGHUP, -SIGSTOP
```

**Facts set:**

| Fact | Description |
|---|---|
| `linux_generic_fproc` | Filtered process list from pgrep (cacheable) |

---

### Network

Define `linux_generic_network` to include `network.yml`.

```yaml
linux_generic_network:
  ss_all: false         # required — true to display all connections, ignores ss_state
  ss_state: listening   # required when ss_all: false — listening or established
  ss_protocol: tcp      # required — tcp or udp
  ss_port: 80           # optional — filter on port number (1-65535)
```

**Facts set:**

| Fact | Description |
|---|---|
| `linux_generic_socket_stats` | Socket statistics from ss (cacheable) |

---

### Storage

Define `linux_generic_storage` to include `storage.yml`.

```yaml
linux_generic_storage:

  # Optional — list of paths to recursively remove
  # yes_i_really_mean_it must be explicitly set per path
  remove_paths:
    - path: /tmp/data
      yes_i_really_mean_it: false

  # Optional — list of directories to list and/or unmount
  # Paths marked with unmount: true must be currently mounted
  # This is validated in checks.yml before any tasks run
  directories:
    - path: /mnt/data
      list: true        # list directory contents
      unmount: true     # unmount path if currently mounted
    - path: /mnt/backup
      list: false
      unmount: true
```

**Facts set:**

| Fact | Description |
|---|---|
| `linux_generic_dir_contents` | Directory contents per path (cacheable) |
| `linux_generic_unmounted_paths` | List of successfully unmounted paths (cacheable) |

---

## Checks

`checks.yml` runs before any task file and validates all input variables. Checks are scoped to their group — if a group variable is not defined, its checks are skipped entirely.

| Group | Check |
|---|---|
| compute | `process_filter` is a non-empty string |
| compute | `process_kill` is a boolean |
| compute | `process_kill_signal` is a valid signal when `process_kill: true` |
| network | `ss_all` is a boolean |
| network | `ss_state` is `listening` or `established` when `ss_all: false` |
| network | `ss_protocol` is `tcp` or `udp` |
| network | `ss_port` is between 1 and 65535 when defined |
| storage | `remove_paths` entries have a valid absolute path and boolean `yes_i_really_mean_it` |
| storage | `directories` entries have a valid absolute path and boolean `list` and `unmount` |
| storage | Paths marked `unmount: true` are currently mounted on the remote host |

---

## Example Playbook

### Compute only

```yaml
- hosts: all
  roles:
    - role: linux_generic
      vars:
        linux_generic_compute:
          process_filter: nginx
          process_kill: false
          process_kill_signal: '-SIGTERM'
```

### Network only

```yaml
- hosts: all
  roles:
    - role: linux_generic
      vars:
        linux_generic_network:
          ss_all: false
          ss_state: listening
          ss_protocol: tcp
          ss_port: 80
```

### Storage only

```yaml
- hosts: all
  roles:
    - role: linux_generic
      vars:
        linux_generic_storage:
          remove_paths:
            - path: /tmp/data
              yes_i_really_mean_it: true
          directories:
            - path: /mnt/data
              list: true
              unmount: true
```

### All groups

```yaml
- hosts: all
  roles:
    - role: linux_generic
      vars:
        linux_generic_compute:
          process_filter: nginx
          process_kill: false
          process_kill_signal: '-SIGTERM'

        linux_generic_network:
          ss_all: false
          ss_state: listening
          ss_protocol: tcp
          ss_port: 80

        linux_generic_storage:
          remove_paths:
            - path: /tmp/data
              yes_i_really_mean_it: false
          directories:
            - path: /mnt/data
              list: true
              unmount: true
```

---

## Fact Caching

All facts are set with `cacheable: true`. To persist facts across jobs in AAP, enable **Use Fact Cache** on the Job Template. Facts are scoped per inventory host.

---

## Check Mode

The role is fully check mode compatible. Run with `--check` to validate without making changes.
