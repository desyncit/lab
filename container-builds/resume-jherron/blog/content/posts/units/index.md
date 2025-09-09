+++
title = "bits, nibbles and bytes"
description = "Explains why little b and big B notation are not the same."
date = "2025-08-18"
category = "Units"
author = "desyncit"
tags = ['units']
+++
[iso-org]: https://www.iso.org/about

### A bit, a nibble, a Byte, and a word

_one word is four Bytes, one Byte is two nibbles and one nibble is four bits._

I often notice "non C influenced" keyboard slappers use little 'b' and 'B' interchangeably. I don't think its intentional, but it is important to understand these are two __very__ different symbols that share a hierarchical relationship with one another. Much like how the number ten is a group of two groups of fives, or five groups of two, etc. The important question to really ask here is _"Why does it matter if I use big B or little b?"_ To answer this question, lets start off by referencing a paper written by the _"father of information theory"_, Dr. Claude Elwood Shannon. In Dr. Shannon's infamous paper "A Mathematical Theory of Communication", he mentions:

_The fundamental problem of communication is that of reproducing at one point either exactly or approximately a message selected at another point. Frequently the messages have meaning; that is they refer to or are correlated according to some system with certain physical or conceptual entities._

In other words, we inherently have a problem with the validity of the information being exchanged, due to environmental noise existing on the medium that serves as the exchange. In order to filter out noise and validate the information being exchanged, we need two items (1) A base unit of measure and (2) a structure of groups that allows a set of messages, assembled in said base unit of measure, where we are able to measure and adjust in a repeatable fashion. 
__Figure 1__ below demonstrates this conceptual exchange of information. 

[Figure 1]
~~~
 Information Source: m == f(x,y,t)  
    x,y == The coordinates relative to a cartesian plane.
      t == time index over the interval sample

 Transmitter:        f(m)     The function to operate on the input message(m).  
 Receiver:           f^-1(m)  The inverse function for the transmitter function.  
 Destination:        f(e)     Endpoint the message is intended.  

+----------+  +---------+                     +--------+  +---------+   
|          |  |         |       +---+         |   -1   |  |         |   
| f(x,y,t) |  +m-> f(m) +-------> + +--------->  f (m) +-->  f(e)   +   
|          |  |         |       +-^-+         |        |  |         |   
+----------+  +---------+         |           +--------+  +---------+   
                                  |                                    
                                  |                                    
                                  |
                                  |                                
                               +--+---+                                
                               |      |
                               |      |   Noise source
                               +------+                                
~~~ 

So now let's start off by resolving the first constraint for a base unit of measure. Referring, back to Dr. Shannon's paper, the concept of a "binary digit" is born.

"_The choice of a logarithmic base corresponds to the choice of a unit for measuring information. If the base 2 is used the resulting units may be called binary digits, or more briefly bits, a word suggested by J. W. Tukey. A device with two stable positions, such as a relay or a flip-flop circuit, can store one bit of information._"

Additionally,

"_N such devices can store N bits, since the total number of possible states is 2^N and log_2 2^N = N.   
 If the base 10 is used the units may be called decimal digits._"

This illustrates that a "bit" is a short hand representation for "binary digit". But in itself __IS NOT__ a number but a representation of a state at some time index. With the concept of bit defined, You may ask, "What does that have to with little b and big B?" 
