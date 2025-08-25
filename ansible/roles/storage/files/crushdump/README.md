Not ideal but the storage that was donated lol. 

Crushmap was setup this way in order to facilitate two constraints

1. Loose a full full host with a full set of OSDs contained within that host and still be able to serve client IO
2. Ensure at a minimum we have two copies of data in each leaf node ( aka osd ).

```
 -1         20.95888  root default              
-10         10.47940      chassis alpha         
-13          5.23965          host a-vtx01-01   
 17    ssd   0.87328              osd.17        
 24    ssd   0.87328              osd.24        
 25    ssd   0.87328              osd.25        
 26    ssd   0.87328              osd.26        
 27    ssd   0.87328              osd.27        
 28    ssd   0.87328              osd.28        
-15          5.23975          host a-vtx01-02   
 18    ssd   0.87328              osd.18        
 19    ssd   0.87328              osd.19        
 20    ssd   0.87328              osd.20        
 21    ssd   0.87328              osd.21        
 22    ssd   0.87328              osd.22        
 23    ssd   0.87328              osd.23        
-17         10.47948      chassis beta          
-19          5.23975          host b-vtx02-01   
  0    ssd   0.87328              osd.0         
  1    ssd   0.87328              osd.1         
  2    ssd   0.87328              osd.2         
  3    ssd   0.87328              osd.3         
  4    ssd   0.87328              osd.4         
  5    ssd   0.87328              osd.5         
-21          5.23975          host b-vtx02-02   
  6    ssd   0.87328              osd.6         
  7    ssd   0.87328              osd.7         
  8    ssd   0.87328              osd.8         
  9    ssd   0.87328              osd.9         
 10    ssd   0.87328              osd.10        
 11    ssd   0.87328              osd.11        
```


The custom crush map shown below was designed
```json
[
  {
    "rule_id": 0,
    "rule_name": "replicated_rule",
    "type": 1,
    "steps": [
      {
        "op": "take",
        "item": -1,
        "item_name": "default"
      },
      {
        "op": "chooseleaf_firstn",
        "num": 0,
        "type": "host"
      },
      {
        "op": "emit"
      }
    ]
  },
  {
    "rule_id": 1,
    "rule_name": "replicated_ntwo",
    "type": 1,
    "steps": [
      {
        "op": "take",
        "item": -2,
        "item_name": "default~ssd"
      },
      {
        "op": "chooseleaf_firstn",
        "num": 2,
        "type": "host"
      },
      {
        "op": "emit"
      }
    ]
  },
  {
    "rule_id": 2,
    "rule_name": "replicated_nfour",
    "type": 1,
    "steps": [
      {
        "op": "take",
        "item": -2,
        "item_name": "default~ssd"
      },
      {
        "op": "choose_firstn",
        "num": 0,
        "type": "chassis"
      },
      {
        "op": "chooseleaf_firstn",
        "num": 2,
        "type": "host"
      },
      {
        "op": "emit"
      }
    ]
  }
]
``` 


