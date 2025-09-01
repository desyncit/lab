+++
title = "baremetal-switch"
date = "2025-08-30"
category = "Networking"
author = "desyncit"
description = "This is a story about how a data center technician wrinkled his brain."
+++
# Prelude 

[tdevs-cloud-project]: https://www.tampadevs.com/blog/2024/20240819-the-public-cloud-project
---
## Reflection
Sigh....I have been kicking this can down the road for too long at this point. I guess this is as good as 
a time as any to write this blog post. But figured I would share this with the void we call the internet, maybe 
there is someone that would find this useful. 

Or some AI agent scanning the open internet for data. 

## Intro..ish
Okay to start, this blog post is about all the "fun" I had with trying to understand the bare metal switch world. Mainly through this beautiful girl that is still being used to this day. She is supporting the [TampaDevs Cloud project](https://www.tampadevs.com/blog/2024/20240819-the-public-cloud-project).

{{< figure
    src="posts/bms/images/200_019.png"
>}}

There has always been one particular piece of networking equipment that I have been in love with ( don't judge me lol, this is the thing I like ).Its the infamous Top Of Rack switch(TOR). A couple of years ago, whilst I working for Red Hat, I wanted to find a switch for my mini data center lab. But not just any switch, but a `Quanta T3048-LY9`, an awesome `40 Gbp/s leaf switch`!

{{< figure
    src="posts/bms/images/200_029.png"
>}}

{{< figure
    src="posts/bms/images/200_028.png"
>}}

However everytime I tried to search for one, there was always an eight thousand dollar price tag associated with it. Needless to say, I could not in good sense shell out that amount of money, when I didn't have a "real" need for it. However, Thor & Odin decided to smile down upon me and grace me some really awesome coworkers.

It all started at one day at work ( Red Hat ), where this was this homelab google chat channel ( Before slack decided to come around and RUIN EVERYTHING! ). It was a place where fellow home lab nerds could ping out for help or showcase their builds. Taking a shot in the dark, I pinged out to ask if anyone knew where I could find a used `T3048-LY9`. A couple of members instantly responded with a listing for the exact switch I was looking for, but for $250! It was listed for sale from a reseller out of minesota, who I called and demanded they take my money. The sales guy I spoke with told me there was nothing wrong with the switch, outside of having no operating system.  

This is the part where I was not fully aware of the naivety I possesed. I mentioned to the sales guy on the phone at the time, "Its fine I can figure it out". Looking back now, I had ZERO idea what I was about to put myself through. Let me just say this, the switch world is a giant troll pit, that was so HARD to figure out. But so...so rewarding to figure out. In the end, I was able to get a solid grasp on why it is almost impossible to understand without secret squirrel knowledge.

---

# Chapter 1: Preliminary information

Before we can get to the really cool stuff, we need to go over the basic types of switches and how the hardware is generally laid out. This is not going to be an Electronic engineering level course, a general overview of the information I discovered. 

## Types of switches

1. Proprietary switch
     A switch is considered customized or proprietary if the application-specific integrated circuit (ASIC) is custom-built for a purpose rather than a common merchant silicon ASIC from Broadcom, Marvell, or Intel, etc.

2. Bare-metal switches.  

     This is the category this journey falls into, but these switches are from the original design manufacturers (ODMs) with no network operating system loaded on them. An ODM, such as Accton, Alpha Networks, or Quanta are companies that design and manufacture a product as specified by another company to be rebranded or sold to a reseller ( this is generally why the price of a network switch is so freaking high!)

     While most network switch ODMs offer their products through a few distributors (Quanta does this ), Accton rebrands its switches as Edge-Core, global branded business from the Accton Technology Group ( Yay corporate funn).

     Warranties offered by ODMs are just hardware based and very basic ( I would argue almost useless ). You must procure, separately, a third-party Network operating system(NOS), which will generally have their own support and warranties.  

   For example:  
   - [Big Switch](https://github.com/bigswitch)
   - [Nvidia Cumulus Linux](https://www.nvidia.com/en-us/networking/ethernet-switching/cumulus-linux)
   - [Pica8](https://www.pica8.com)
   - [PicOS](https://www.pica8.com/picos-software)
   - [fboss](https://github.com/facebook/fboss)
  
3. White-box (off-shelf components) switch

   In my opinion, only offering proprietary solutions to lock me in and jack up the price because "why not" is the reason Cisco lost its foot hold on the networking world. But here is some secret squirrel info I found. 
   
   What many don't know is that all vendors offer switches based on merchant silicon ASIC ( merchant meaning Broadcom ), and have for years. The vendors just don't advertise this very well. A majority of HP's switch models have merchant silicon in them, and Arista's entire product line uses merchant silicon ( i.e broadcom ). Back in 2015 most of the vendors released switches based on the Broadcom Trident II silicon. Trust me when I say a lot of them are the same switch and come from the same ODM. Basically, white boxes are commodity-based bare-metal switches with a network operating system (third-party or traditional networking vendor) preloaded, such as Juniper's OCX1100.

## Hardware layout

   The logical layout, shown below in `Figure 1.`, is the the high level overview without getting into the i2c and PCI-E, whilst `Figure 2.` shows a more detailed version of whats going on at a hardware layer inside a network switch. 

Figure 1.
{{< figure
    src="posts/bms/images/image01.png"
    width="auto"
    height="auto"
>}}
  
Figure 2. 
{{< figure
    src="posts/bms/images/200_014.png"
    width="auto"                      
    height="auto"
>}}

---

If we study Figure 2 for a second, We get a hint as to whats going on. The `CPU Module` talks to directly to the `BCM56854 ASIC` via some sort of freaking witchcraft (more than likely in VHDL or VERILOG), which then programs the front panel switch ports. This is the secret sauce that is SEVERLY CLOSED SOURCE, broadcom uses an SDK to program these ports and good luck getting ahold of it.

*Pausing as of Sat Aug 30 04:57:10 PM EDT 2025 get back to studying norsk but wanted to at least get this started*








