+++
title = "Units are so important!"
date = "2025-08-18"
category = "Units"
author = "desyncit"
description = ""
+++

[iso-org]: https://www.iso.org/about

### A bit, a nibble, a Byte, and a word

_one word is four Bytes, one Byte is two nibbles and one nibble is four bits._

These days I often see the "non C influenced" keyboard slappers mistakenly use little 'b' and 'B' interchangeably. But it is important to understand these are two very different symbols that share a hierarchical relationship with one another. Much like how the number ten is a grouping of two groups of fives, or five groups of two, etc.

But the important question to really ask here is _"Why does it matter if I use big B or little b?"_ To answer this question, lets start off by referencing a paper written by the _"father of information theory"_, Dr. Claude Elwood Shannon. In Dr. Shannon's infamous paper "A Mathematical Theory of Communication", he mentions:

_The fundamental problem of communication is that of reproducing at one point either exactly or approximately a message selected at another point. Frequently the messages have meaning; that is they refer to or are correlated according to some system with certain physical or conceptual entities._

But in other words, we inherently have a problem with the validity of the information being exchanged, due to environmental noise existing on the medium that serves as the exchange. As such, in order to filter out the noise and validate the information being exchanged, we need a base unit of measure. One that allows us to create a system for which we can select multiple messages in a set of messages in a repeatable fashion. __Figure 1__ below demonstrates this conceptual exchange of information.

[Figure 1]
~~~
 Information Source: m == f(x,y,t)  x,y == two space coordinates and t == time index over the interval sample
 Transmitter:        f(m) The function to operate on the input message(m).                                                      
 Receiver:           f^-1(m)  The inverse function for the transmitter function.        
 Destination:        f(y)   is the person (or thing) for whom the message is intended.

+--------+  +--------+                     +--------+  +--------+   
|        |  |        |       +---+         |   -1   |  |        |   
| f(x)   +m->  f(m)  +------->   +--------->  f (m) +-->  f(y)  +   
|        |  |        |       +-^-+         |        |  |        |   
+--------+  +--------+         |           +--------+  +--------+   
                               |                                    
                               |                                    
                               |
                               |                                
                            +--+---+                                
                            |      |
                            |      |   Noise source
                            |      |
                            +------+                                
~~~ 

But before we can send anything, we need to select a base unit and then develop structures and/or groups around that base unit in order to scale up the system. Referring, back to Dr. Shannon's paper, the concept of a "binary digit" is born.

_The choice of a logarithmic base corresponds to the choice of a unit for measuring information. If the base 2 is used the resulting units may be called binary digits, or more briefly bits, a word suggested by J. W. Tukey._

But I would like to highlight this statement from above excerpt 

_"If the base 2 is used the resulting units may be called binary digits, or more briefly bits, device with two stable positions, such as a relay or a flip-flop circuit, can store one bit of
information. N such devices can store N bits, since the total number of possible states is 2**N and log_2 2**N = N. If the base 10 is used the units may be called decimal digits."_

This statement alone illustrates that a "bit" is an abbreviation or pointer to the phrase "binary digit". Okay but this just defines a bit or binary digit, what does it have to with little b and big B? Well now we need to introduce an organization named _International Organization for Standardization_ ( [click me for more info][iso-org] ). The standard that defines the binary digit symbol "b" is defined in `ISO/IEC 80000, Quantities and units part 13: Information science and technology`.
