+++
title = "The Infamous Data Center Top of Rack Switch (TOR)"
date = "2025-08-30"
category = "Networking"
author = "Justin Herron"
description = "This is a story about how a data center technician wrinkled his brain."
+++

[p1]: https://www.tampadevs.com/blog/2024/20240819-the-public-cloud-project

---

## Intro
This is a story about all the "fun" I had with trying to understand the world in which computer network switches are born. Mainly through this beautiful box that is currently supporting the [Tampa Devs Public Cloud Project][p1].

{{< figure src="images/MjAwXzAxOS5wbmcgMTQzODcK"  class="center" >}}

In the early days of my career, there was this one type of network switch that I have been in love with. The infamous Top Of Rack switch(TOR)! A couple of years ago, whilst I working for Red Hat, I wanted to find a switch for my mini data center lab. But not just any switch, but a `Quanta T3048-LY9`! An awesome `40 Gbp/s leaf switch`!

{{< figure src="images/MjAwXzAyOC5wbmcgMjYyNTcK" height="50%" width="50%" >}}

However everytime I would search and find one, there was always an eight thousand dollar price tag associated with it. Needless to say, I could not in good sense shell out that amount of money, when I didn't have a "real" need for it. However, the networking gods decided to smile down upon me and grace me some really amazing coworkers.

It all started one day at while working at Red Hat. Taking a shot in the dark, I pinged out into this google chat group called homelab, to ask if anyone had come across a used `T3048-LY9`. A couple of members instantly responded with a listing for the exact switch I was looking for, but for `$ 250`! The listing showed it for sale out of minnesota. After reaching and demanding they take my money, the sales associate I spoke with told me there was nothing wrong with the switch, outside of having no operating system. I mentioned to the sales assiciate on the phone at the time, "Its fine I can figure it out". 

Now this is the part where you could think "ohh cool this awesome right?" Wrong, this is the part where I was not fully aware of my naivety. Looking back now, I had ZERO idea what I was about to put myself through. Let me just say this, the switch world is a giant troll pit where, that was so HARD to figure out. But so...so rewarding to figure out. In the end, I was able to get a solid grasp on why it is almost impossible to understand without secret squirrel knowledge.

---

# Chapter 1: Preliminary information

Before we can get to the really cool stuff, we need to go over the basic types of switches. This is not going to be engineering level course, but a general overview of the information I discovered. 

## Types of switches

1. Proprietary switch 
 
     A switch is considered customized or proprietary if the application-specific integrated circuit (ASIC) is custom-built for a purpose rather than a common merchant silicon ASIC from Broadcom, Marvell, or Intel, etc.

2. Bare-metal switches.    

     This is the category this journey falls into, these switches are from the original design manufacturers (ODMs) with no network operating system loaded on them. An ODM, such as Accton, Alpha Networks, or Quanta are companies that design and manufacture a product as specified by another company to be rebranded or sold to a reseller ( this is generally why the price of a network switch is so high!). While most network switch ODMs offer their products through a few distributors (Quanta does this ), Accton rebrands its switches as Edge-Core, global branded business from the Accton Technology Group. Warranties offered by ODMs are just hardware based and very basic ( I would argue almost useless ). You must procure, separately, a third-party Network operating system(NOS), which will generally have their own support and warranties.  

   For example:  
   - [Big Switch](https://github.com/bigswitch)
   - [Nvidia Cumulus Linux](https://www.nvidia.com/en-us/networking/ethernet-switching/cumulus-linux)
   - [Pica8](https://www.pica8.com)
   - [PicOS](https://www.pica8.com/picos-software)
   - [fboss](https://github.com/facebook/fboss)
  
3. White-box (off-shelf components) switch

   In my opinion, only offering proprietary solutions to lock me in and jack up the price because "why not" is the reason Cisco lost its foot hold on the networking world. What is interesting is all switch vendors offer switches based on merchant silicon ASIC, they vendors just don't advertise this very well. A majority of HP's switch models have merchant silicon in them, and Arista's entire product line uses merchant silicon ( i.e broadcom ). Basically, white boxes are bare-metal switches with a network operating system (third-party or traditional networking vendor) preloaded, such as Juniper's OCX1100.

## Hardware layout

   The logical layout, shown below in `Figure 1.`, is a high level depiction, without getting into the i2c and PCI-E. Whilst `Figure 2.` shows a more detailed version of whats going on at a hardware layer inside a network switch.

Figure 1.
{{< figure src="images/aW1hZ2UwMS5wbmcgMjk5OTAK"  height="50%" width="50%" >}}
  
Figure 2. 
{{< figure src="images/MjAwXzAxNC5wbmcgMTMyMzEK"  height="50%" width="50%" >}}

---

If we study Figure 2 for a second, We get a hint as to whats going on. The `CPU Module` talks to directly to the `BCM56854 ASIC` via some sort of witchcraft (more than likely in VHDL or VERILOG), which then somehow activates the front panel switch ports. This is the secret sauce that is SEVERLY CLOSED SOURCE, broadcom uses an SDK to program these ports and good luck getting ahold of it.

*Pausing as of Sat Aug 30 04:57:10 PM EDT 2025 get back to studying norsk but wanted to at least get this started*
