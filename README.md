# Puppeteer Node Scripts to check Impfterminservice.de for available codes and vaccination appointments

IMPORTANT: Use at your own risk and accountability. MIT License.

## Functionality

The Scripts are able to check for the __availability of appointment codes__ (Vermittlungscodes) and __time slots for actual vaccinations__ (Impftermine) for given appointment codes.

There are two script available based on puppeteer and chromium to browse impfterminservice.de like a normal user. The scripts need to run in a desktop environment (desktop or virtual machine) to allow the user making inputs in the browser if time slots are available (input personal information).

The program is not designed to run on a server w/o UI. 

To notify you if a code or slot can be optained a Slack Webhook Url can be provided optionally.

The tools helped me to find multiple codes and slots within 24 hrs. The execution of the scripts can be automated locally with crond or launchd. You don't need to query impfterminservice.de too often, otherwise your IP is blocked for a certain timeframe (429, too many requests).

### getCodes.js

Checks impfterminservice.de for available codes (Vermittlungscodes). Provide a list of vaccination centers as ENV Variable. The code will be provided by email after your registration.

Actual code availability depends on the vaccines available for different age groups (according to STIKO recommendations).

L922 = AstraZeneca - 60+ only

__Execute Script:__

``
CENTER_LIST=229:79108,002:70174 node getCodes.js
``

### checkAppointments.js

Checks impfterminservice.de for available time slots for given codes (Vermittlungscode). You can provide multiple Codes and vaccination center plz's as a comma seperated list as ENV variable.

__Execute Script:__

``
CODES=RLHP-GCUQ-6566:70174:002,KIKM-YQ98-GRV5:71065:229 node checkAppointments.js
``


## Environment Variables

### Slack Notification (optional)

``
SLACK_WEBHOOK=/services/T8Z060QE9/B023DQTRQN5/7M9NvpyaCkIKqjHIyh1nvZqC
``

### :envelope: getCodes.js

Comma seperated list of Vaccination Centers with Server ID and PLZ
Format: <Server-ID>:<PLZ>

The Server-ID and PLZ can be found in the Url of your desired vaccination center: https://<Server-ID>-iz.impfterminservice.de/impftermine/service?plz=<PLZ>

``
CENTER_LIST=229:79108,002:70174,229:71065,002:78224,005:72213,001:70376,003:74549,229:79541
``

### :date: checkAppointments.js

Comma seperated list of Appointment Codes (Vermittlungscode) and vaccination center information
Format: <Appointment Code>:<PLZ>:<Server-ID>

The information can be found in the Url confirmation email of the Vermittlungscode: https://<Server-ID>-iz.impfterminservice.de/impftermine/suche/<Appointment Code>/<PLZ>

``
CODES=RLHP-GCUQ-6566:70174:002,KIKM-YQ98-GRV5:71065:229
``

(Just dummy codes above :smirk:)