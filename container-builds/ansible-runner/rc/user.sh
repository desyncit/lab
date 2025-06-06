#!/bin/bash
function monty(){
 declare -a _pipd _pipa
  _pipd+=("wheel")
  _pipd+=("pyghmi")

  _pipa+=("ansible<9.9")
  _pipa+=("ansible-lint")
  _pipa+=("ansible-pylibssh")

  python -m pip install --upgrade --user ${_pipd[@]};
  python -m pip install --upgrade --user ${_pipa[@]};

  unset  _pipa pipd 
  return 0
}

function main(){
  printf "Well lets grab this holy hand granade and go!\n"
    monty
  return 0 
}
main
