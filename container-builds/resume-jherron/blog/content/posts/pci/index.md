+++
title = "PCI Bus"
date = "2025-08-11"
category = "Protocols"
author = "desyncit"
description = "As pci devices become more and more prevalent, this log is a notebook on how data moves across the bus"
+++

### What is PCIe and why should I care?

PCIe stands for Peripheral Component Interconnect Express. It was introduced first in 2003 and evolved from the older PCI and PCI-X specifications that grew in popularity in the early PC era (with the added “e” for Express to differentiate it).

#### Investigating a PCIe Hierarchy - A packet switched network

The most major change from legacy PCI to PCIe was the change from a true bus topology to a point-to-point 
link. You can think of this as the evolution of Ethernet hubs to Ethernet switches of today. Each link is 
a separate point-to-point link that is routed just like an Ethernet cord on a packet-switched Ethernet network. 

One must carefully learn that this word "bus" does not mean multiple PCIe devices are talking on the same physical link.
Packets (known as transaction level packets aka TLPs) travel across each individual link and the switching devices in the 
hierarchy deliver the packet to the proper ports using routing information within the packet.

The root of the PCI tree is known as the __Root Complex__ (abbreviated as RC) and is the sole owner of all things PCIe on the system. It is
located physically on the CPU sillicon and it responsible for acting as the hsot that all PCIe devices receive and send packets with. 

Each BAR is a small 32-bit memory location that points to another (usually much larger) memory region which we'll 
call the corresponding "BAR region". Each BAR tells the CPU the base address + width + other properties of its BAR 
region. The CPU can then read and write to that BAR region to talk to the PCIe device.

When you read or write to offsets within the BAR region, TLP 

```
+--------+                  +------------+       +------+       +-------------+
| device |>---------------->| function 0 |>----->| BAR0 |>----->| BAR0 region |
| xx:yy  |                  | xx:yy.0    |       +------+       +-------------+
|        |>------------+    |            |
|        |             |    |            |       +------+       +-------------+
   ...        ...      |    |            |>----->| BAR1 |>----->| BAR1 region |
|        |             |    |            |       +------+       +-------------+
|        |>--------+   |    |            |
+--------+         |   |         ...        ...    ...
                   |   |    |            |
                   |   |    |            |       +------+       +-------------+
                   |   |    |            |>----->| BAR5 |>----->| BAR5 region |
                   |   |    +------------+       +------+       +-------------+
                   |   |
                   |   |
                   |   |    +------------+       +------+       +-------------+
                   |   +--->| function 1 |>----->| BAR0 |>----->| BAR0 region |
                   |        | xx:yy.1    |       +------+       +-------------+
                   |        |            |               
                   |        |            |       +------+       +-------------+
                   |        |            |>----->| BAR1 |>----->| BAR1 region |
                   |        |            |       +------+       +-------------+
                   |        |            |               
                   |             ...        ...    ...   
                   |        |            |               
                   |        |            |       +------+       +-------------+
                   |        |            |>----->| BAR5 |>----->| BAR5 region |
                   |        +------------+       +------+       +-------------+
                   |
                   |
                   |             ...
                   |
                   |
                   |        +------------+       +------+       +-------------+
                   +------->| function 7 |>----->| BAR0 |>----->| BAR0 region |
                            | xx:yy.7    |       +------+       +-------------+
                            |            |               
                            |            |       +------+       +-------------+
                            |            |>----->| BAR1 |>----->| BAR1 region |
                            |            |       +------+       +-------------+
                            |            |               
                            |            |               
                            |            |       +------+       +-------------+
                            |            |>----->| BAR5 |>----->| BAR5 region |
                            +------------+       +------+       +-------------+
``` 

![terminal](images/tlp-write3.png)


#### References
[1] [Down to the TLP: How PCI express devices talk (Part I)](https://xillybus.com/tutorials/pci-express-tlp-pcie-primer-tutorial-guide-1)
