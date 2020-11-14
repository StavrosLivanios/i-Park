# i-Park
Web application that allows you to see available parking near the place you want to go
The application displays a map (Leaflet API) on which the user can click any
location and produce pins where parking would be available.

![alt text](https://github.com/StavrosLivanios/i-Park/blob/develop/gifs/ezgif.com-video-to-gif%20(1).gif?raw=true  width="250" height="250")
<img src="https://github.com/StavrosLivanios/i-Park/blob/develop/gifs/ezgif.com-video-to-gif%20(1).gif" width="250" height="500"/>

Additionally, the user can input information on how far he is willing to park from the place he chose and at what time of the
day he intends to park there. The map is divided in polygons that are stored in a MySQL
database including the parking predictions for the part of the city its polygon belongs.
 The application has an admin login were the admin can edit the polygons information and
upload or delete them. Web application created using NodeJS, ExpressJS, MySQL, HTML,
CSS and JavaScript.
