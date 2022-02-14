

 Builtin questions 
===================



The following items can be easily reused in your layers

## Table of contents

1. [Builtin questions](#builtin-questions)
    + [questions](#questions)
    + [images](#images)
    + [export_as_gpx](#export_as_gpx)
    + [wikipedia](#wikipedia)
    + [reviews](#reviews)
    + [minimap](#minimap)
    + [phone](#phone)
    + [osmlink](#osmlink)
    + [wikipedialink](#wikipedialink)
    + [email](#email)
    + [website](#website)
    + [wheelchair-access](#wheelchair-access)
    + [dog-access](#dog-access)
    + [description](#description)
    + [opening_hours](#opening_hours)
    + [service:electricity](#serviceelectricity)
    + [payment-options](#payment-options)
    + [payment-options-advanced](#payment-options-advanced)
    + [last_edit](#last_edit)
    + [all_tags](#all_tags)
    + [level](#level)
    + [default](#default)
    + [defaults](#defaults)
    + [isOpen](#isopen)
    + [phonelink](#phonelink)
    + [emaillink](#emaillink)
    + [sharelink](#sharelink)





### questions 



Read-only tagrendering



### images 



{image_carousel()}{image_upload()}

Read-only tagrendering



### export_as_gpx 



{export_as_gpx()}

Read-only tagrendering



### wikipedia 



{wikipedia():max-height:25rem}

What is the corresponding Wikidata entity?



  - No Wikipedia page has been linked yet




### reviews 



{reviews()}

Read-only tagrendering



### minimap 



{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}

Read-only tagrendering



### phone 



<a href='tel:{phone}'>{phone}</a>

What is the phone number of {name}?



  - <a href='tel:{contact:phone}'>{contact:phone}</a>




### osmlink 



<a href='https://openstreetmap.org/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>

Read-only tagrendering



  - 
  - <a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>




### wikipedialink 



<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' alt='WP'/></a>

Read-only tagrendering



  - <a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>




### email 



<a href='mailto:{email}' target='_blank'>{email}</a>

What is the email address of {name}?



  - <a href='mailto:{contact:email}' target='_blank'>{contact:email}</a>




### website 



<a href='{website}' target='_blank'>{website}</a>

What is the website of {name}?



  - <a href='{contact:website}' target='_blank'>{contact:website}</a>




### wheelchair-access 



Is this place accessible with a wheelchair?



  - This place is specially adapted for wheelchair users
  - This place is easily reachable with a wheelchair
  - It is possible to reach this place in a wheelchair, but it is not easy
  - This place is not reachable with a wheelchair




### dog-access 



Are dogs allowed in this business?



  - Dogs are allowed
  - Dogs are <b>not</b> allowed
  - Dogs are allowed, but they have to be leashed
  - Dogs are allowed and can run around freely




### description 



{description}

Is there still something relevant you couldn't give in the previous questions? Add it here.<br/><span style='font-size: small'>Don't repeat already stated facts</span>



### opening_hours 



<h3>Opening hours</h3>{opening_hours_table(opening_hours)}

What are the opening hours of {name}?



### service:electricity 



Does this amenity have electrical outlets, available to customers when they are inside?



  - There are plenty of domestic sockets available to customers seated indoors, where they can charge their electronics
  - There are a few domestic sockets available to customers seated indoors, where they can charge their electronics
  - There are no sockets available indoors to customers, but charging might be possible if the staff is asked
  - There are a no domestic sockets available to customers seated indoors




### payment-options 



Which methods of payment are accepted here?



  - Cash is accepted here
  - Payment cards are accepted here




### payment-options-advanced 



Which methods of payment are accepted here?



  - Cash is accepted here
  - Payment cards are accepted here
  - Payment is done using a dedicated app
  - Payment is done using a membership card




### last_edit 



<div class='subtle' style='font-size: small; margin-top: 2em; margin-bottom: 0.5em;'><a href='https://www.openStreetMap.org/changeset/{_last_edit:changeset}' target='_blank'>Last edited on {_last_edit:timestamp}</a> by <a href='https://www.openStreetMap.org/user/{_last_edit:contributor}' target='_blank'>{_last_edit:contributor}</a></div>

Read-only tagrendering



### all_tags 



{all_tags()}

Read-only tagrendering



### level 



Located on the {level}th floor

On what level is this feature located?



  - Located underground
  - Located on the ground floor
  - Located on the ground floor
  - Located on the first floor
  - Located on the first basement level




### default 



Read-only tagrendering



### defaults 



Read-only tagrendering



### isOpen 



Read-only tagrendering



  - clock:#0f0;ring:#0f0
  - circle:#f00;clock:#fff
  - clock:#ff0;ring:#ff0
  - circle:#f0f;clock:#fff




### phonelink 



<a href='tel:{phone}'><img src='./assets/svg/phone.svg'/></a>

Read-only tagrendering



### emaillink 



<a href='mailto:{email}'><img src='./assets/svg/send_email.svg'/></a>

Read-only tagrendering



### sharelink 



{share_link()}

Read-only tagrendering 

This document is autogenerated from [SharedTagRendings.ts](https://github.com/pietervdvn/MapComplete/blob/develop/SharedTagRendings.ts), [assets/tagRenderings/questions.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/tagRenderings/questions.json)