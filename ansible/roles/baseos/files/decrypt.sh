#!/bin/bash

function errno(){
	local argv=$1

	case ${argv} in
		*)
		printf "Stuff broke homie\n"
		;;
	esac
  return 0
}

function is_connected(){
        local id_yubikey="1050:0404"
	local v=$(1>/dev/null lsusb -d ${id_yubikey}; echo $?)
	return ${v}
}

function u(){
        . /etc/vault/main/.pad
	local x=${pad}

	local key=$( base64 -d <<< 'L2V0Yy92YXVsdC9tYWluL2tleQo=' )

	for (( i=$(( 16 % 6 )); i>0; i--)); do
	   x=$(base64 -d <<< ${x} )
	done
	2>/dev/null gpg --quiet --no-verbose \
	                --pinentry-mode loopback \
	                --passphrase ${x} \
	                --decrypt ${key}
 return 0
}

function main(){
	local argv=("$@")
	local argc=$#

	is_connected  && u || errno broken

  return 0
}

main
