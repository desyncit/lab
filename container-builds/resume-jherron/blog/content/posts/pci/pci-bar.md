+++
title = "PCI Bus  "
date = "2025-08-11"
category = "Norsk"
author = "Justin Herron ( desyncit )"
description = "As pci devices become more and more prevalent, this log is a notebook on how data moves across the bus"
+++

### Summary

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

![terminal](posts/pci/img/tlp-write3.png)


#### References
[1] [Down to the TLP: How PCI express devices talk (Part I)](https://xillybus.com/tutorials/pci-express-tlp-pcie-primer-tutorial-guide-1)
