import $ from 'jquery'
import _ from 'lodash'
import CircleType from 'circletype';
import Webcam from 'webcamjs';
import Instascan from 'instascan'

import PaperCup from '../Papercup'

var globalQR;
var theme;
var isLink = false;
var timer;
var audioFile = require('./assets/garden.mp3');

var paperCupChild = new PaperCup.PaperCupChild();


window.prevlink = {};

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}


function isBook(s) {
  if (s.includes('checkout') || s.includes('object')) {
    //      console.log("BOOK");
    return true;
  } else {
    //console.log("PLOT");
    return false;
  }
}

window.isBook = isBook;

function isName(s) {
  return !isBook(s);
}

function urlToId(s) {
  // show qr url
  // $("#qrurl").html(s);




  return s.split("/")[s.split("/").length - 1];

}
window.urlToId = urlToId;

function parseQR(content) {


  var res = {};
  res.books = {};
  res.names = {};
  res.type = {};


  content.forEach(function(d, i) {
    if (isBook(d)) {
      res.books[urlToId(d)] = d;
      res.type = "book";
      //        console.log(res.type);
    }
    if (isName(d)) {
      res.names[urlToId(d)] = d;
      res.type = "name";
      //            console.log(res.type);
    }
  });
  // console.log(res);
  return res;
}

function resetQR() {
  window.prevlink = {};
};

function handleScans(content) {

  // setTimeout(resetQR, 12000);


  // new CircleType(document.getElementById('garden_title'))
  // .radius(188);

  var res = parseQR(content);
  console.log('garden name', res);
  console.log('prev name', window.prevlink);
  if (!(_.isEqual(window.prevlink, res))) {

    
    if (Object.values(window.prevlink).length != 0) {
      var prevQRURL = Object.values(window.prevlink.names)[0]
    } else {
      var prevQRURL = ""
    }


    window.prevlink = res;
    console.log("new QR!!!!");
    isLink = true;
    globalQR = content;

    var thisQRURL = content[0]

    firstScan();

    // get the badge url and display everywhere
    paperCupChild.sendRequest("getBadgeTitle", thisQRURL, function(garden_name) {
      console.log("badge url to garden name");
      console.log("badge url: " + thisQRURL);
      console.log("garden name: " + garden_name);
      $('#garden_title').html(garden_name);
      $('#garden_title').show();
    });

    if(prevQRURL != "") {
      // if there was a valid previous QR
      // aka WE HAVE A LINK
      //
      var msg = { "link_from": prevQRURL, "link_to": thisQRURL }

      console.log("scanner:: I'm trying to submit a link!");

      paperCupChild.sendRequest("submitLink", msg, function() { 
        console.log("scanner:: LINK SUBMITTED");
        console.log(msg);
      });
      const audioBuffer = new Audio(audioFile);
      audioBuffer.play();
    }
  } else {
//    console.log('settting title to nothing')
//    $('#garden_title').html("");
//    isLink = false;
  };
};



function firstScan() {
  $("#cam1").hide();
  newGarden();
  $("#freeze1").addClass("grayscale blur").delay(1500).css('transform', 'translateY(70%)');
};


function refresh() {
  console.log("refreshhhhhhhh");
  $('#prompt').fadeIn("slow");
  $("#freeze1").css('transform', 'translateY(0%)').fadeOut("slow");
  $('#cam1').delay(700).fadeIn("slow");
  $('#garden_title').fadeOut("slow");
  clearTimeout(timer);
  // $('#garden_title').css("color", "#9fd6a7");
  // resetQR();
}



function newGarden() {
  $("#freeze1").fadeOut(0);
  //freeze cam
  Webcam.snap(function(data_uri) {
    document.getElementById('freeze1').innerHTML = '<img src="' + data_uri + '"/>';
  });

  $("#freeze1").fadeIn("slow");

  console.log("hiii");
  $('#garden_title').css("color", "#214f32");
  $('body').css("background", "linear-gradient(rgba(79, 140, 96, 0) 60%, rgba(86, 144, 81, 0.4))");

  $('#prompt').hide();
  timer = setTimeout(function() {
    refresh();
  }, 20000);
}




$(document).ready(function() {


  $('#prompt').css("top", "-218px");
  $('#cam1').css("left", "calc(50% - 137px)");



  // new CircleType(document.getElementById('garden_title'))
  // .radius(245);



  Webcam.attach('#cam1');

  let scanner = new Instascan.Scanner({
    video: document.getElementById('cam1')
  });

  scanner.addListener('scan', function(content) {
    handleScans(content)
  });


  Instascan.Camera.getCameras().then(function(cameras) {
    if (cameras.length > 0) {
      scanner.start(cameras[0]);
    } else {
      console.error('No cameras found.');
    }
  }).catch(function(e) {
    console.error(e);
  });


});
