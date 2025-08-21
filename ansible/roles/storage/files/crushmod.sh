#!/bin/bash

for i in {0..5}; do 
	ceph osd crush move osd.${i} root=default chassis=beta host=b-vtx02-01
	ceph config set osd.${i} crush_location 'root=default chassis=beta host=b-vtx02-01'
done
for i in {6..11}; do 
	ceph osd crush move osd.${i} root=default chassis=beta host=b-vtx02-02
        ceph config set osd.${i} crush_location 'root=default chassis=beta host=b-vtx02-02'
done
for i in {24..28}; do 
	ceph osd crush move osd.${i} root=default chassis=alpha host=a-vtx01-01
	ceph config set osd.${i} crush_location 'root=default chassis=alpha host=a-vtx01-01'
done
for i in {18..23}; do 
	ceph osd crush move osd.${i} root=default chassis=alpha host=a-vtx01-02;
	ceph config set osd.${i} crush_location 'root=default chassis=alpha host=a-vtx01-02'
done

for i in {12..14}; do 
	ceph osd crush move osd.${i} root=glacier zone=z1
	ceph config set osd.${i} crush_location 'root=glacier zone=z1'
done
for i in {15..16} 29; do 
	ceph osd crush move osd.${i} root=glacier zone=z2; 
	ceph config set osd.${i} crush_location 'root=glacier zone=z2'
done



