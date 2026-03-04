from ansible.utils.display import Display

def warn(data, condition, message=""):
    if condition:
       Display().warning(message)
    return data


class FilterModule(object):
    def filters(self):
        return {
            'warn': warn
        }

