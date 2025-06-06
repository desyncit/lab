#!/bin/bash

function main(){
  printf "Install packages\n";
  
  declare -a pcks

  pcks+=("python")
  pcks+=("python-pip")
  
  pacman --noconfirm -Sy ${pcks[@]} 

  return 0
}

main
