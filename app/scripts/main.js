$(document).ready(function() {

	'use strict';

  var firebaseURL = 'https://glaring-torch-9804.firebaseio.com/';
  var databRef = new Firebase( firebaseURL );
  // Sæt referencer op til de forskellige grene af databasen
  var ryttereTempoRef = databRef.child( 'ryttere/tempo' );
  var ryttereSprintRef = databRef.child( 'ryttere/sprint' );
  var ryttereBrostRef = databRef.child( 'ryttere/brost' );
  var ryttereBakkeRef = databRef.child( 'ryttere/bakke' );
  var ryttereBjergRef = databRef.child( 'ryttere/bjerg' );

	// Byg rytter værdier ud fra indtastning i inputs
	var bygRytter = function(navn, hold) {
		var tvivlBtn = ' <span id="tvivlRytter"><i class="fa fa-warning tvivl-gra"></i></span>';
		var starBtn = ' <span id="favoRytter"><i class="fa fa-star-o"></i></span>';
		var rytterHTML = '<li>' + starBtn + tvivlBtn + navn;
		var delBtn = ' <span id="sletRytter"><i class="fa fa-remove"></i></span>';
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
				// Byg rytter HTML
				var rytter = bygRytter(navn, hold);
				// Append til tempo-gruppen
				$( rytterGrp ).append( rytter );
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

	// Autovælg navneinput
	var nameInput = document.getElementById('rytterNavn');
	nameInput.focus();
	nameInput.select();

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

	// Vælg navne-input igen
	var selectNameInput = function() {
		rytterNavnInput.focus();
		rytterNavnInput.select();
	};

	var tilfojRytter = function(rytterGrp, dbRef) {
		// Dan HTML for en rytter
		var rytter = bygRytter(navn, hold);
		// Nu er en rytter tilføjet så slå alert, om at man kan trykke enter, fra
		showEnterAlert = false;
		$( rytterGrp ).append( rytter );
		// Send til Firebase. Child-node til tempo referencen (sat længere op) sættes med rytters navn og denne får hold som child
    dbRef.child( navn ).set({ // 'navn' og 'hold' dannes i funktionen bygRytter
      hold: hold,
      starred: false
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
		output[output.length-1] = '';
		return output;
	};

	// Tilføj rytter ved tryk på enter
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #brost, #bakke, #bjerg' ).keyup( function(e) {
		navn = $( '#rytterNavn' ).val();
		navn = titelCase( navn );
		hold = $( '#rytterHold' ).val();

		// Når der trykkes enter i inputs...
		if ( e.keycode === 13 || e.which === 13 ) {
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
		}
	});

	// Mobil: Tilføj ved tryk på knap 'Tilføj rytter'
	$( '#btnTilfojMobil' ).on('click', function () {
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
	});

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

	// Fyld stjerne ud og flyt til top, ved tryk på denne (og tøm og flyt til under 9. rytter ved tryk igen)
	$( 'body' ).on( 'click', '#favoRytter i', function() {
		$( this ).toggleClass( 'fa-star-o fa-star' );
		var li = $( this ).closest( 'li' );
		var ul = $( this ).closest( 'ul' );
		var li9 = $( '#' + ul.attr( 'id' ) + ' li:nth-child(10)' );
		if ( $( this ).hasClass( 'fa-star' ) ) {
			ul.prepend( li );
		} else {
			li9.after( li );
		}
	});

	// Farv tvivl skilt ved tryk (og grey out ved tryk igen)
	$( 'body' ).on( 'click', '#tvivlRytter i', function() {
		$( this ).toggleClass( 'tvivl-gra tvivl-rod' );
	});

	// Slet rytter både fra DOM og Firebase ved tryk på rød knap i hver <li>
	$( '.container' ).on( 'click', '#sletRytter', function() {
		var rytter = $( this ).closest( 'li' ); // Find tættest li
		var rytterMeta = rytter.text(); // Træk teksten ud af dette li
		var rytterNavn = rytterMeta.slice(0, rytterMeta.indexOf(',')); // Træk navn ud af text node (hent string indtil komma)
		var rytterNavnString = $.trim( rytterNavn.toString() );
		var rytterGrp = rytter.closest( 'ul' ); // Find gruppen denne li er del af
		var rytterGrpId = rytterGrp.attr( 'id' ); // Træk ID'et på denne gruppe ud

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

	});

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
        'box-shadow': '0px 2px 0px 0px rgba(0, 0, 0, .15)'
      });
      rytterData.css({ 'margin-top': '112px' });
    } else {
    	tilfojRytterBlock.stop().css({
        position: 'relative',
        'box-shadow': 'none'
      });
      rytterData.css({ 'margin-top': '0px' });
    }
  });

	/* ----- / .tilfoj-rytter-blok følger med scroll når skærmtop når til den ----- */


});