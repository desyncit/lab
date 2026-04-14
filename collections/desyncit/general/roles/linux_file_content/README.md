# linux_file_content

An Ansible role for reading, editing, and concatenating files on remote Linux hosts.

---

## Requirements
- The file path must exist on the remote host

---

## Role Variables

| Variable | Type | Required | Description |
|---|---|---|---|
| `linux_file_content_path` | string | yes | Absolute path to the target file on the remote host |
| `linux_file_content_operation` | string | yes | Operation to perform: `edit` or `concatenate` |
| `linux_file_content_edit_mode` | string | when `operation=edit` | Edit strategy: `line`, `replace`, or `block` |
| `linux_file_content_backup` | bool | yes | Whether to backup the file before editing |
| `linux_file_content_line` | string | when `edit_mode=line` | Line content to insert or replace |
| `linux_file_content_regexp` | string | when `edit_mode=line\|replace` | Regular expression to match against |
| `linux_file_content_replace_with` | string | when `edit_mode=replace` | Replacement string for matched pattern |
| `linux_file_content_block` | string | when `edit_mode=block` | Multi-line block content to insert |

---

## Operations

### `concatenate`

Reads the content of the remote file into an Ansible fact using `ansible.builtin.slurp`.

After the task runs, the file content is available as:
```
linux_file_content_data
```

### `edit`

Edits the remote file using one of three strategies controlled by `linux_file_content_edit_mode`.

#### `line`

Inserts or replaces a single line using `lineinfile`. Use `linux_file_content_regexp` to match an existing line to replace.

#### `replace`

Performs a regex find-and-replace across the entire file using `replace`.

#### `block`

Inserts or updates a multi-line block using `blockinfile`. The block is wrapped in Ansible-managed markers:

```
# BEGIN ANSIBLE MANAGED BLOCK
...
# END ANSIBLE MANAGED BLOCK
```

All edit tasks run with `diff: true` for visibility into changes.

---

## Backup Behaviour

When `linux_file_content_backup: true`, a timestamped backup of the file is created in the same directory as the source file before any edit is applied. To customise the backup location, handle the backup manually using the `copy` module with `remote_src: true` prior to including this role.

---

## Example Playbook

```yaml
- hosts: all
  vars:
    linux_file_content_path: /etc/myapp/config.conf
    linux_file_content_operation: edit
    linux_file_content_edit_mode: line
    linux_file_content_backup: true
    linux_file_content_line: "max_connections=100"
    linux_file_content_regexp: '^max_connections'

  roles:
    - linux_file_content
```

### Concatenate a file into a fact

```yaml
- hosts: all
  vars:
    linux_file_content_path: /etc/myapp/config.conf
    linux_file_content_operation: concatenate
    linux_file_content_backup: false

  roles:
    - linux_file_content

- name: Use the fact
  ansible.builtin.debug:
    var: linux_file_content_data
```

---

## Task Files

| File | Description |
|---|---|
| `main.yml` | Entry point, gates execution on CentOS |
| `checks.yml` | Validates all input variables and file path |
| `edit.yml` | Handles `line`, `replace`, and `block` edit modes |
| `concatenate.yml` | Reads remote file content into a fact |

---

## Check Mode

The role is check mode aware. When run with `--check`, a debug message is displayed confirming no changes will be made. All tasks respect check mode natively.
