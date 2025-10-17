for f in /etc/profile.include.d/*.include; do
  . "${f}"
done
unset f
