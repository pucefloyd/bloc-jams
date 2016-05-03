var albumKaldor = {
     title: 'The Course',
      artist: 'Johnnie Kaldor',
      label: 'JK',
     year: '2016',
      albumArtUrl: 'assets/images/album_covers/10.png',
      songs: [
          { title: 'Hello?', duration: '1:10' },
          { title: 'Ring', duration: '4:01' },
          { title: 'Pocket', duration: '3:50'},
          { title: 'Hear me now?', duration: '2:24' },
          { title: 'Wrong', duration: '3:00'}
      ]
  };

  var getSongNumberCell = function(number) {
      return $('.song-item-number[data-song-number="' + number + '"]');

  };

  var createSongRow = function(songNumber, songName, songLength) {
      var template =
         '<tr class="album-view-song-item">'
        + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
        + '  <td class="song-item-title">' + songName + '</td>'
        + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
        + '</tr>'
  ;
  
       var $row = $(template);

       var clickHandler = function() {

       var songNumber = parseInt($(this).attr('data-song-number'));

          if (currentlyPlayingSongNumber !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            
            currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
         
         if (currentlyPlayingSongNumber !== songNumber) {
             // Switch from Play -> Pause button to indicate new song is playing.
             setSong(songNumber);
             currentSoundFile.play();
             $(this).html(pauseButtonTemplate);
             currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
             updateSeekBarWhileSongPlays();
             updatePlayerBarSong();

             var $volumeFill = $('.volume .fill');
             var $volumeThumb = $('.volume .thumb');
             $volumeFill.width(currentVolume + '%');
             $volumeThumb.css({left: currentVolume + '%'});

         } else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()) {
              $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
           } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();   
            }
            
         }
       };
 

       var onHover = function(event) {
         var songNumberCell = $(this).find('.song-item-number');
         var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
       };

       var offHover = function(event) {
          var songNumberCell = $(this).find('.song-item-number');
          var songNumber = parseInt(songNumberCell.attr('data-song-number'));

          console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
       };

       // #1
       $row.find('.song-item-number').click(clickHandler);
     // #2
       $row.hover(onHover, offHover);
     // #3
       return $row;
  };
   
  var setSong = function(songNumber) {

      if (currentSoundFile) {
         currentSoundFile.stop();
     }

      currentlyPlayingSongNumber = parseInt(songNumber);
      currentSongFromAlbum = currentAlbum.songs[songNumber -1];
      currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
         // #2
         formats: [ 'mp3' ],
         preload: true
     });

      setVolume(currentVolume);
  };

  var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
  };

  var setVolume = function(volume) {
     if (currentSoundFile) {
         currentSoundFile.setVolume(volume);
     }
 };

   var setCurrentAlbum = function(album) {
   currentAlbum = album;
      // Selecting elements here that I want to populate dynamically
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list');
  
     $albumTitle.text(album.title);
     $albumArtist.text(album.artist);
     $albumReleaseInfo.text(album.year + ' ' + album.label);
     $albumImage.attr('src', album.albumArtUrl);
  
     $albumSongList.empty();
  
     for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
          $albumSongList.append($newRow);
      }
  };

  var setCurrentTimeInPlayerBar = function (currentTime) {
      var $currentTimeElement = $('.seek-control .current-time');
      $currentTimeElement.text(currentTime);
  };

  var setTotalTimeInPlayerBar = function(totalTime) {
      var $totalTimeElement = $('.seek-control .total-time');
      $totalTimeElement.text(totalTime);
  };

  var filterTimeCode = function(timeInSeconds) {
      var seconds = Number.parseFloat(timeInSeconds);
      var wholeSeconds = Math.floor(seconds);
      var minutes = Math.floor(wholeSeconds / 60);
      var remainingSeconds = wholeSeconds % 60;

      var output = minutes + ':';
      if (remainingSeconds <10) {
          output += '0';
      }

      output += remainingSeconds;

      return output;
  };

  var updateSeekBarWhileSongPlays = function() {
     if (currentSoundFile) {
         currentSoundFile.bind('timeupdate', function(event) {
             //var seekBarFillRatio = this.getTime() / this.getDuration();
             var currentTime = this.getTime();
             var songLength = this.getDuration();
             var seekBarFillRatio = currentTime / songLength;
             var $seekBar = $('.seek-control .seek-bar');
             updateSeekPercentage($seekBar, seekBarFillRatio);
             setCurrentTimeInPlayerBar(filterTimeCode(currentTime));
         });
     }
 };

  var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
 
    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
 };

 var setupSeekBars = function() {
     var $seekBars = $('.player-bar .seek-bar');
 
     $seekBars.click(function(event) {
         
         var offsetX = event.pageX - $(this).offset().left;
         var barWidth = $(this).width();
         var seekBarFillRatio = offsetX / barWidth;
         if ($(this).parent().attr('class') == 'seek-control') {
             seek(seekBarFillRatio * currentSoundFile.getDuration());
         } else {
             setVolume(seekBarFillRatio * 100);   
         }
         updateSeekPercentage($(this), seekBarFillRatio);
     });


   $seekBars.find('.thumb').mousedown(function(event) {
         var $seekBar = $(this).parent();
         $(document).bind('mousemove.thumb', function(event){
             var offsetX = event.pageX - $seekBar.offset().left;
             var barWidth = $seekBar.width();
             var seekBarFillRatio = offsetX / barWidth;
             if ($seekBar.parent().attr('class') == 'seek-control') {
                 seek(seekBarFillRatio * currentSoundFile.getDuration());   
             } else {
                 setVolume(seekBarFillRatio);
             }
             updateSeekPercentage($seekBar, seekBarFillRatio);
         });
         $(document).bind('mouseup.thumb', function() {
             $(document).unbind('mousemove.thumb');
             $(document).unbind('mouseup.thumb');
         });
     });
  };
 
  var updatePlayerBarSong = function() {
 
     $('.currently-playing .song-name').text(currentSongFromAlbum.title);
     $('.currently-playing .artist-name').text(currentAlbum.artist);
     $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
     //$('.currently-playing .total-time').text(currentSongFromAlbum.duration);
     $('.main-controls .play-pause').html(playerBarPauseButton);
     setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.length));
 };

 var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
 };
 
 var nextSong = function() {
    
    var getLastSongNumber = function(index) {
         return index == 0 ? currentAlbum.songs.length : index;
     };
     
     var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
     // Note that we're _incrementing_ the song here
     currentSongIndex++;
     
     if (currentSongIndex >= currentAlbum.songs.length) {
         currentSongIndex = 0;
     }
     
    // Set a new current song
     setSong(currentSongIndex + 1);
     currentSoundFile.play();
     updateSeekBarWhileSongPlays();
     currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
 
     // Update the Player Bar information
     $('.currently-playing .song-name').text(currentSongFromAlbum.title);
     $('.currently-playing .artist-name').text(currentAlbum.artist);
     $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
     $('.main-controls .play-pause').html(playerBarPauseButton);
     
     var lastSongNumber = getLastSongNumber(currentSongIndex);
     var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
     var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
     
     $nextSongNumberCell.html(pauseButtonTemplate);
     $lastSongNumberCell.html(lastSongNumber);
     
 };   
 
 var previousSong = function() {
     
     // Note the difference between this implementation and the one in
     // nextSong()
     var getLastSongNumber = function(index) {
         return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
     };
     
     var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
     currentSongIndex--;
     
     if (currentSongIndex < 0) {
         currentSongIndex = currentAlbum.songs.length - 1;
     }
     
     // Set a new current song
     setSong(currentSongIndex + 1);
     currentSoundFile.play();
     updateSeekBarWhileSongPlays();
     currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
 
     // Update the Player Bar information
     $('.currently-playing .song-name').text(currentSongFromAlbum.title);
     $('.currently-playing .artist-name').text(currentAlbum.artist);
     $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
     $('.main-controls .play-pause').html(playerBarPauseButton);
     
     var lastSongNumber = getLastSongNumber(currentSongIndex);
     var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
     var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
     
     $previousSongNumberCell.html(pauseButtonTemplate);
     $lastSongNumberCell.html(lastSongNumber);
     
 };

   
  // Album button templates 
 var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
 var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
 var playerBarPlayButton = '<span class="ion-play"></span>';
 var playerBarPauseButton = '<span class="ion-pause"></span>';
  // Storing the state of playing songs below


 var currentAlbum = null;
 var currentlyPlayingSongNumber = null;
 var currentSongFromAlbum = null;
 var currentSoundFile = null;
 var currentVolume = 80;
 
 var $previousButton = $('.main-controls .previous');
 var $nextButton = $('.main-controls .next');
 var $playPauseButton = $('.main-controls .play-pause');

  
  $(document).ready(function() {
      setCurrentAlbum(albumPicasso);
      setupSeekBars();
      $previousButton.click(previousSong);
      $nextButton.click(nextSong);
      $playPauseButton.click(togglePlayFromPlayerbar);

/*    var albums = [albumMarconi, albumKaldor, albumPicasso];
     var albumArt = document.getElementsByClassName('album-cover-art')[0];
     var i = 0;
 
     albumArt.addEventListener('click', function(event) {
         setCurrentAlbum(albums[i]);
         if(i == albums.length - 1){
             i = 0;
         }
         else{
             i++;
         }
     }); */
 });

  