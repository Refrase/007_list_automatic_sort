$(document).ready(function() {

	'use strict';
	// Telling jsHint to ignore hinting external scripts
	// - probably not recognized because they are called in index.html
	/* global FastClick:false */
	/* global Firebase:false */

	/* ----- Remove tap-delay (300ms) on iOS devices ----- */
	$(function() { FastClick.attach(document.body); });

	/* ----- Database references (Firebase) -----*/

  var firebaseURL = 'https://glaring-torch-9804.firebaseio.com/';
  var databRef = new Firebase( firebaseURL );
  // Sæt referencer op til de forskellige grene af databasen
  var ryttereTempoRef = databRef.child( 'ryttere/tempo' );
  var ryttereSprintRef = databRef.child( 'ryttere/sprint' );
  var ryttereBrostRef = databRef.child( 'ryttere/brost' );
  var ryttereBakkeRef = databRef.child( 'ryttere/bakke' );
  var ryttereBjergRef = databRef.child( 'ryttere/bjerg' );

  /* ----- / Database references (Firebase) -----*/

	// Byg rytter værdier ud fra indtastning i inputs (favorit + tvivlsom argumenterne bruges kun når der hentes fra databasen)
	var bygRytter = function(navn, hold, favorit, tvivlsom) {
		var tvivlBtnTrue = ' <span id="tvivlRytter"><i class="fa fa-warning tvivl-rod"></i></span>';
		var starBtnTrue = ' <span id="favoRytter"><i class="fa fa-star"></i></span>';
		var tvivlBtnFalse = ' <span id="tvivlRytter"><i class="fa fa-warning tvivl-gra"></i></span>';
		var starBtnFalse = ' <span id="favoRytter"><i class="fa fa-star-o"></i></span>';
		var delBtn = ' <span id="sletRytter"><i class="fa fa-remove"></i></span>';

		var rytterHTML = '<li>';
		if ( favorit === true) { rytterHTML += starBtnTrue; }
		else { rytterHTML += starBtnFalse; }
		if ( tvivlsom === true) { rytterHTML += tvivlBtnTrue; }
		else { rytterHTML += tvivlBtnFalse; }
		rytterHTML += navn;
		if ( hold !== '' ) { rytterHTML += ', ' + hold + delBtn + '</li>'; }
		else { rytterHTML += delBtn + '</li>'; }
		return rytterHTML;
	};

	// Hent al data i Firebase databasen
	var hentRyttere = function(dbRef, rytterGrp) {
		dbRef.once('value', function(snapshot) {
		  snapshot.forEach(function(childSnapshot) {
		  	// Hent key for hver (navnet)
		  	var navn = childSnapshot.key();
		  	// Hent values for hver
		  	var rytterData = childSnapshot.val();
		  	// ... og træk holdet ud af den data
		  	var hold = rytterData.hold;
		  	// ... og træk favorit ud af den data
		  	var favorit = rytterData.favorit;
		  	// ... og træk tvivlsom ud af den data
		  	var tvivlsom = rytterData.tvivlsom;
				// Byg rytter HTML
				var rytter = bygRytter(navn, hold, favorit, tvivlsom);
				// Prepend til gruppe givet ved argumentet 'rytterGrp', hvis stjerne er fyldt ud...
				if ( favorit === true ) { $( rytterGrp ).prepend( rytter ); }
				// ... ellers append
				else { $( rytterGrp ).append( rytter ); }
		  });
		}, function (errorObject) {
		  console.log('The read failed: ' + errorObject.code);
		});
	};

	hentRyttere(ryttereTempoRef, '#tempoGrp'); // ryttereTempoRef sat højere oppe
	hentRyttere(ryttereSprintRef, '#sprintGrp');
	hentRyttere(ryttereBrostRef, '#brostGrp');
	hentRyttere(ryttereBakkeRef, '#bakkeGrp');
	hentRyttere(ryttereBjergRef, '#bjergGrp');

	var navn;
	var hold;

	// Gem inputs i variabler
	var rytterNavnInput = $( '#rytterNavn' );
	var rytterHoldInput = $( '#rytterHold' );

	// Gem kategori checkboxes i variabler
	var tempo = $( '#tempo' );
	var sprint = $( '#sprint' );
	var brost = $( '#brost' );
	var bakke = $( '#bakke' );
	var bjerg = $( '#bjerg' );

	// Funktion der resetter inputs ved successfuld tilføjelse til listen
	var resetInputs = function() {
		rytterNavnInput.val('');
		rytterHoldInput.prop('selectedIndex', 0);
	};

	// Autovælg navne-input
	var selectNameInput = function() {
		rytterNavnInput.focus();
		rytterNavnInput.select();
	};

	var tilfojRytter = function(rytterGrp, dbRef) {
		// Dan HTML for en rytter
		var rytter = bygRytter(navn, hold); // Tager også argumenterne, 'favorit' og 'tvivlsom'. Bruges kun når de hentes fra DB længere oppe, da favorit og tvivlsom først markeres efter rytteren er tilføjet.
		// Nu er en rytter tilføjet så slå alert, om at man kan trykke enter, fra
		showEnterAlert = false;
		$( rytterGrp ).append( rytter );
		// Send til Firebase. Child-node til tempo referencen (sat længere op) sættes med rytters navn og denne får hold som child
    dbRef.child( navn ).set({ // 'navn' og 'hold' dannes i funktionen bygRytter
      hold: hold,
      favorit: false,
      tvivlsom: false
    });
		resetInputs();
		selectNameInput();
	};

	// Filtrer input, så første bogstav i hvert ord i navnet bliver stort, resten småt
	var titelCase = function(string) {
		var words = string.split(' ');
		var output = '';
		for ( var i = 0 ; i < words.length; i++ ){
			var lowerWord = words[i].toLowerCase();
			lowerWord = lowerWord.trim();
			var capitalizedWord = lowerWord.slice(0,1).toUpperCase() + lowerWord.slice(1);
			output += capitalizedWord;
			if ( i !== words.length - 1 ){
				output += ' ';
			}
		}
		// output[output.length-1] = '';
		return output;
	};

	var tjekGrpAtTilfojeRytter = function() {
		navn = $( '#rytterNavn' ).val();
		navn = titelCase( navn );
		hold = $( '#rytterHold' ).val();

		// Alt efter hvilken checkbox der er checked OG hvis de andre inputs ikke er tomme, append rytteren given gruppe
		if ( tempo.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0 ) {
			tilfojRytter('#tempoGrp', ryttereTempoRef);
		} else if ( sprint.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0 ) {
			tilfojRytter('#sprintGrp', ryttereSprintRef);
		} else if ( brost.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0 ) {
			tilfojRytter('#brostGrp', ryttereBrostRef);
		} else if ( bakke.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0 ) {
			tilfojRytter('#bakkeGrp', ryttereBakkeRef);
		} else if ( bjerg.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0 ) {
			tilfojRytter('#bjergGrp', ryttereBjergRef);
		} else { // Ellers giv en advarsel om at der mangler at blive udfyldt inputs
			$('.alerts').append('<h4 class="alert alert-warning col-xs-12">Udfyld lige alle felter, du!</h4>');
			$('.alert').delay(3000).fadeOut();
		}
	};

	// Desktop: Tilføj rytter ved tryk på enter
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #brost, #bakke, #bjerg' ).keyup( function(e) {
		if ( e.keycode === 13 || e.which === 13 ) { tjekGrpAtTilfojeRytter(); }
	});
	// Mobil: Tilføj ved tryk på knap 'Tilføj rytter'
	$( '#btnTilfojMobil' ).on('click', tjekGrpAtTilfojeRytter );

	// Vis opfordring (første gang) til at trykke enter, når alle værdier er udfyldt
	var showEnterAlert = true; // Sættes til 'false' når rytter tilføjes med tryk på enter (se længere oppe)
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #brost, #bakke, #bjerg' ).on('change', function() {
		if ( rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0 && $('.checkboxes input:radio:checked').length > 0 ) {
			if ( showEnterAlert === true ) {
				$('.alerts').append('<h4 class="alert alert-warning col-xs-12">Hit enter!</h4>');
			}
		}
		$('.alert').delay(3000).fadeOut();
	});

	var hentRytterLiNavnOgGrpId = function ( btn ) {
		var rytter = $( btn ).closest( 'li' ); // Find tættest li
		var rytterMeta = rytter.text(); // Træk teksten ud af dette li
		var rytterNavn = rytterMeta.slice(0, rytterMeta.indexOf(',')); // Træk navn ud af text node (hent string indtil komma)
		var rytterNavnString = $.trim( rytterNavn.toString() );
		var rytterGrp = rytter.closest( 'ul' ); // Find gruppen denne li er del af
		var rytterGrpId = rytterGrp.attr( 'id' ); // Træk ID'et på denne gruppe ud
		return [rytter, rytterNavnString, rytterGrpId];
	};

	/* ----- Fyld stjerne ud og flyt til top, ved tryk på denne (og tøm og flyt til under 9. rytter ved tryk igen) ----- */

	$( 'body' ).on( 'click', '#favoRytter', function() {
		var rytterLiNavnOgGrpId = hentRytterLiNavnOgGrpId( this );
		var rytterNavnString = rytterLiNavnOgGrpId[1];
		var rytterGrpId = rytterLiNavnOgGrpId[2];
		var favoritSti = '/favorit';

		var li = $( this ).closest( 'li' );
		var ul = $( this ).closest( 'ul' );

		var thisIcon = $( this ).children( 'i' );
		$( thisIcon ).toggleClass( 'fa-star-o fa-star' );

		if ( $( thisIcon ).hasClass( 'fa-star' ) ) {
			// Flyt rytteren til toppen af listen
			ul.prepend( li );
			// Sæt favorit til true baseret på hvilken gruppe rytter er i
			if ( rytterGrpId === 'tempoGrp' ) {
				ryttereTempoRef.child( rytterNavnString + favoritSti ).set( true );
			}
			else if ( rytterGrpId === 'sprintGrp' ) {
				ryttereSprintRef.child( rytterNavnString + favoritSti ).set( true );
			}
			else if ( rytterGrpId === 'brostGrp' ) {
				ryttereBrostRef.child( rytterNavnString + favoritSti ).set( true );
			}
			else if ( rytterGrpId === 'bakkeGrp' ) {
				ryttereBakkeRef.child( rytterNavnString + favoritSti ).set( true );
			}
			else if ( rytterGrpId === 'bjergGrp' ) {
				ryttereBjergRef.child( rytterNavnString + favoritSti ).set( true );
			}
		} else {
			// Flyt rytteren til lige udenfor 'FULDT HOLD'
			ul.append( li );
			// Sæt favorit til false baseret på hvilken gruppe rytter er i
			if ( rytterGrpId === 'tempoGrp' ) {
				ryttereTempoRef.child( rytterNavnString + favoritSti ).set( false );
			}
			else if ( rytterGrpId === 'sprintGrp' ) {
				ryttereSprintRef.child( rytterNavnString + favoritSti ).set( false );
			}
			else if ( rytterGrpId === 'brostGrp' ) {
				ryttereBrostRef.child( rytterNavnString + favoritSti ).set( false );
			}
			else if ( rytterGrpId === 'bakkeGrp' ) {
				ryttereBakkeRef.child( rytterNavnString + favoritSti ).set( false );
			}
			else if ( rytterGrpId === 'bjergGrp' ) {
				ryttereBjergRef.child( rytterNavnString + favoritSti ).set( false );
			}
		}
	});

	/* ----- / Fyld stjerne ud og flyt til top, ved tryk på denne (og tøm og flyt til under 9. rytter ved tryk igen) ----- */

	/* ----- Farv tvivl skilt ved tryk (og grey out ved tryk igen) ----- */

	$( 'body' ).on( 'click', '#tvivlRytter', function() {
		var rytterLiNavnOgGrpId = hentRytterLiNavnOgGrpId( this );
		var rytterNavnString = rytterLiNavnOgGrpId[1];
		var rytterGrpId = rytterLiNavnOgGrpId[2];
		var tvivlsomSti = '/tvivlsom';

		var thisIcon = $( this ).children( 'i' );
		$( thisIcon ).toggleClass( 'tvivl-gra tvivl-rod' );

		if ( $( thisIcon ).hasClass( 'tvivl-rod' ) ) {
			// Sæt tvivlsom til true baseret på hvilken gruppe rytter er i
			if ( rytterGrpId === 'tempoGrp' ) {
				ryttereTempoRef.child( rytterNavnString + tvivlsomSti ).set( true );
			}
			else if ( rytterGrpId === 'sprintGrp' ) {
				ryttereSprintRef.child( rytterNavnString + tvivlsomSti ).set( true );
			}
			else if ( rytterGrpId === 'brostGrp' ) {
				ryttereBrostRef.child( rytterNavnString + tvivlsomSti ).set( true );
			}
			else if ( rytterGrpId === 'bakkeGrp' ) {
				ryttereBakkeRef.child( rytterNavnString + tvivlsomSti ).set( true );
			}
			else if ( rytterGrpId === 'bjergGrp' ) {
				ryttereBjergRef.child( rytterNavnString + tvivlsomSti ).set( true );
			}
		} else {
			// Sæt tvivlsom til false baseret på hvilken gruppe rytter er i
			if ( rytterGrpId === 'tempoGrp' ) {
				ryttereTempoRef.child( rytterNavnString + tvivlsomSti ).set( false );
			}
			else if ( rytterGrpId === 'sprintGrp' ) {
				ryttereSprintRef.child( rytterNavnString + tvivlsomSti ).set( false );
			}
			else if ( rytterGrpId === 'brostGrp' ) {
				ryttereBrostRef.child( rytterNavnString + tvivlsomSti ).set( false );
			}
			else if ( rytterGrpId === 'bakkeGrp' ) {
				ryttereBakkeRef.child( rytterNavnString + tvivlsomSti ).set( false );
			}
			else if ( rytterGrpId === 'bjergGrp' ) {
				ryttereBjergRef.child( rytterNavnString + tvivlsomSti ).set( false );
			}
		}
	});

	/* ----- / Farv tvivl skilt ved tryk (og grey out ved tryk igen) ----- */

	/* ----- Slet rytter både fra DOM og Firebase ved tryk på rød knap i hver <li> ----- */

	$( '.container' ).on( 'click', '#sletRytter', function() {
		var rytterLiNavnOgGrpId = hentRytterLiNavnOgGrpId( this );
		var rytter = rytterLiNavnOgGrpId[0];
		var rytterNavnString = rytterLiNavnOgGrpId[1];
		var rytterGrpId = rytterLiNavnOgGrpId[2];

		// Spørg om man er sikker på sletning
		if ( window.confirm( 'Fjern ' + rytterNavnString + '?' ) ) {
			rytter.remove(); // Fjern rytter fra DOM

			// Slet rytter fra Firebase
			if ( rytterGrpId === 'tempoGrp' ) {
				ryttereTempoRef.child( rytterNavnString ).remove();
			}
			else if ( rytterGrpId === 'sprintGrp' ) {
				ryttereSprintRef.child( rytterNavnString ).remove();
			}
			else if ( rytterGrpId === 'brostGrp' ) {
				ryttereBrostRef.child( rytterNavnString ).remove();
			}
			else if ( rytterGrpId === 'bakkeGrp' ) {
				ryttereBakkeRef.child( rytterNavnString ).remove();
			}
			else if ( rytterGrpId === 'bjergGrp' ) {
				ryttereBjergRef.child( rytterNavnString ).remove();
			}
		}
	});

	/* ----- / Slet rytter både fra DOM og Firebase ved tryk på rød knap i hver <li> ----- */

	/* ----- Vis/skjul kategori-lister ----- */

	var visListe = function( listeOverskrift ) {
		$( listeOverskrift ).on( 'click', function () {
			var pil = $( this ).children( '.fa-fold-ud' );
			pil.toggleClass( 'fa-minus fa-plus');
			$( this ).next( 'ul' ).toggle({
				effect: 'slide',
				direction: 'up',
				duration: 300,
				easing: 'easeInOutQuart'
			});
		});
	};

	var tempoGrpTitle = '#tempoGrpTitle';
	var sprintGrpTitle = '#sprintGrpTitle';
	var brostGrpTitle = '#brostGrpTitle';
	var bakkeGrpTitle = '#bakkeGrpTitle';
	var bjergGrpTitle = '#bjergGrpTitle';

	visListe( tempoGrpTitle );
	visListe( sprintGrpTitle );
	visListe( brostGrpTitle );
	visListe( bakkeGrpTitle );
	visListe( bjergGrpTitle );

	/* ----- / Vis/skjul kategori-lister ----- */

	// Sortérbar [jQuery UI]
	// $( '#tempoGrp, #sprintGrp, #brostGrp, #bakkeGrp, #bjergGrp' ).sortable({
		// connectWith: '.connectedSortable'
		// Implementér sortering mellem grupper, når det er sat op med Firebase
	// });

	/* ----- .tilfoj-rytter-blok følger med scroll når skærmtop når til den ----- */

  var windo = $( window );
  var tilfojRytterBlock = $( '.tilfoj-rytter-blok' );
  var tilfojRytterBlockOffs = tilfojRytterBlock.offset();
  var rytterData = $( '#rytterData' );

  windo.scroll( function() {
    if ( windo.scrollTop() > tilfojRytterBlockOffs.top ) {
      tilfojRytterBlock.stop().css({
        position: 'fixed',
        top: '0px',
        '-webkit-box-shadow': '0 8px 8px -4px rgba(0, 0, 0, .15)',
	   		'-moz-box-shadow': '0 8px 8px -4px rgba(0, 0, 0, .15)',
	      'box-shadow': '0 8px 8px -4px rgba(0, 0, 0, .15)'
      });
      rytterData.css({ 'margin-top': '112px' });
    } else {
    	tilfojRytterBlock.stop().css({
        position: 'relative',
        '-webkit-box-shadow': 'none',
        '-moz-box-shadow': 'none',
        'box-shadow': 'none'
      });
      rytterData.css({ 'margin-top': '0px' });
    }
  });

	/* ----- / .tilfoj-rytter-blok følger med scroll når skærmtop når til den ----- */


});