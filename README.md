hw 1 for cs 1060.

Conan Lu  
github: conanlu  
netlify deployment: https://stirring-queijadas-280559.netlify.app/  
github repo: https://github.com/conanlu/cs1060-conanlu-hw1/  
bolt url: https://bolt.new/~/sb1-qw2uymrr
bolt deployment: https://dog-image-grid-with-bd33.bolt.host   

I created Dog Gallery, a service that allows users to curate a grid of dog images from random. Each shuffle gives you nine random dogs; click on the images to save them. When you're satisfied, you can export the grid to png.

I used the Dog API, an API for images of dogs. The most common endpoint is https://dog.ceo/api/breeds/image/random Fetch!
 
I spent less than an hour (~40 minutes). The stages were: populate a 3x3 grid using API call > shuffle button > allow users to save images from re-shuffle by clicking > export button. Each stage, barring minor UI tweaks, was functional. There were some UI design paradigms that I needed to instill (e.g. don't make the buttons shift unnecessarily, so don't put "[] images selected" on the same line as the buttons) but Bolt was quick to correct them when I pointed them out.
