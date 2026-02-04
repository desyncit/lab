#!/bin/bash -x

function pmsrc(){
   declare _r
   local i=0
   local _rel='v4.9.1'
   local _xrel='6.24.0' 

   local _dest="./src"
   local _bin="/usr/local/bin/"

   local _msrc="https://downloads.getmonero.org/linux64" 
   local _psrc="https://github.com/SChernykh/p2pool/releases/download/${_rel}/p2pool-${_rel}-linux-x64.tar.gz"
   local _xmrig="https://github.com/xmrig/xmrig/releases/download/v${_xrel}/xmrig-${_xrel}-linux-static-x64.tar.gz"

   for mk in ${_dest} ${_bin}; do
      mkdir ${mk} 2>/dev/null || printf "already exist\n";
   done

   for _ind in ${_msrc} ${_psrc} ${_xmrig}; do
      /usr/bin/curl -LO ${_ind} --output-dir ${_dest};
      _ret=$?
      (( ! ${_ret} )) || errno ${_ret}
      unset ${_ret}
   done

   while read it; 
   do 
     r[ ${i} ]="${it}"
     (( i++ ))
   done < <(ls ./src/*)

   for a in ${!r[@]}; do
      tar -C ${_bin} -xvf ${r[${a}]}  --strip-components=1
   done

   return 0
}

function _xmrig(){
   pmsrc

   /usr/local/bin/xmrig --config /etc/config.json

   return 0     
}

function _p2pool(){
   . /etc/9c15dd200473

   local w=${WALLET} 
   pmsrc
   /usr/local/bin/p2pool \
              --host 127.0.0.1 --rpc-port 18081 \
              --zmq-port 18083 --wallet ${w} \
              --stratum 0.0.0.0:3333 --p2p 0.0.0.0:37889
   return 0
}

function _daemon(){
   local conf="/etc/conf"
   printf "Starting monerod\n"

   pmsrc 
   /usr/local/bin/monerod  --config-file '/etc/conf'

  return 0	
}

function errno(){
  local in="$1"

  case ${in} in
	*)
	printf "Script failed while running at line $BASH_LINENO\n" 
	exit 255;
	;;
  esac
    
  return 0
}

function main(){
  local argc="$#"
  local argv="$@"

  _ret_argc=(" $(( ${argc} > 1 ? 115 : 0 )) ")

  if [[ ${_ret} > 0 ]]; then
    errno ${_ret};
  fi
 
  eval "${argv}"

  return 0
}

main "$@"
