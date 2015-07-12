$(document).ready(function() {

	'use strict';

  var firebaseURL = 'https://glaring-torch-9804.firebaseio.com/';
  var databRef = new Firebase( firebaseURL );
  // Sæt referencer op til de forskellige grene af databasen
  var ryttereTempoRef = databRef.child( 'ryttere/tempo' );
  var ryttereSprintRef = databRef.child( 'ryttere/sprint' );
  var ryttereBrostRef = databRef.child( 'ryttere/brost' );
  var ryttereBjergRef = databRef.child( 'ryttere/bjerg' );

	// Byg rytter værdier ud fra indtastning i inputs
	var bygRytter = function(navn, hold) {
		var rytterHTML = '<li>' + navn;
		var delBtn = ' <span id="sletRytter"><i class="fa fa-remove"></i></span>';
		if ( hold !== '' ) { rytterHTML += ', ' + hold + delBtn + '</li>'; }
		else { rytterHTML += delBtn + '</li>'; }
		return rytterHTML;
	};

	// Hent al data i Firebase databasen
	// Hent temporyttere
	ryttereTempoRef.once('value', function(snapshot) { // ryttereTempoRef sat højere oppe
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
			$( '#tempoGrp' ).append( rytter );
	  });
	}, function (errorObject) {
	  console.log('The read failed: ' + errorObject.code);
	});

	// Hent sprintryttere
	ryttereSprintRef.once('value', function(snapshot) {
	  snapshot.forEach(function(childSnapshot) {
	  	var navn = childSnapshot.key();
	  	var rytterData = childSnapshot.val();
	  	var hold = rytterData.hold;
			var rytter = bygRytter(navn, hold);
			$( '#sprintGrp' ).append( rytter );
	  });
	}, function (errorObject) {
	  console.log('The read failed: ' + errorObject.code);
	});

	// Hent brostensryttere
	ryttereBrostRef.once('value', function(snapshot) {
	  snapshot.forEach(function(childSnapshot) {
	  	var navn = childSnapshot.key();
	  	var rytterData = childSnapshot.val();
	  	var hold = rytterData.hold;
			var rytter = bygRytter(navn, hold);
			$( '#brostGrp' ).append( rytter );
	  });
	}, function (errorObject) {
	  console.log('The read failed: ' + errorObject.code);
	});

	// Hent bjergryttere
	ryttereBjergRef.once('value', function(snapshot) {
	  snapshot.forEach(function(childSnapshot) {
	  	var navn = childSnapshot.key();
	  	var rytterData = childSnapshot.val();
	  	var hold = rytterData.hold;
			var rytter = bygRytter(navn, hold);
			$( '#bjergGrp' ).append( rytter );
	  });
	}, function (errorObject) {
	  console.log('The read failed: ' + errorObject.code);
	});

	//
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

	var tilfojRytter = function(navn, hold) {
		// Dan HTML for en rytter
		var rytter = bygRytter(navn, hold);
		// Nu er en rytter tilføjet så slå alert, om at man kan trykke enter, fra
		showEnterAlert = false;

		// Alt efter hvilken checkbox der er checked OG hvis de andre inputs ikke er tomme, append rytteren given gruppe
		if ( tempo.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0) {
			$( '#tempoGrp' ).append( rytter );
			// Send til Firebase. Child-node til tempo referencen (sat længere op) sættes med rytters navn og denne får hold som child
      ryttereTempoRef.child( navn ).set({ // 'navn' og 'hold' dannes i funktionen bygRytter
        hold: hold
      });
			resetInputs();
			tempo.prop('checked', false);
			selectNameInput();
		}
		else if ( sprint.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0) {
			$( '#sprintGrp' ).append( rytter );
      ryttereSprintRef.child( navn ).set({
        hold: hold
      });
			resetInputs();
			sprint.prop('checked', false);
			selectNameInput();
		}
		else if ( brost.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0) {
			$( '#brostGrp' ).append( rytter );
      ryttereBrostRef.child( navn ).set({
        hold: hold
      });
			resetInputs();
			brost.prop('checked', false);
			selectNameInput();
		}
		else if ( bjerg.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0) {
			$( '#bjergGrp' ).append( rytter );
      ryttereBjergRef.child( navn ).set({
        hold: hold
      });
			resetInputs();
			bjerg.prop('checked', false);
			selectNameInput();
		} else { // Ellers giv en advarsel om at der mangler at blive udfyldt inputs
			$('.alerts').append('<h4 class="alert alert-warning col-sm-8">Udfyld lige alle felter, du!</h4>');
			$('.alert').delay(3000).fadeOut();
		}
	};

	// Filtrer input, så første bogstav bliver stort, resten småt
	var titelCase = function(txt) {
	  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	};

	// Tilføj rytter ved tryk på enter
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #brost, #bjerg' ).keyup( function(e) {
		navn = $( '#rytterNavn' ).val();
		navn = titelCase( navn );
		hold = $( '#rytterHold' ).val();

		// Når der trykkes enter i inputs...
		if ( e.keycode === 13 || e.which === 13 ) {
			tilfojRytter(navn, hold);
		}
	});

	// Mobil: Tilføj ved tryk på knap 'Tilføj rytter'
	$( '#btnTilfojMobil' ).on('click', function () {
		navn = $( '#rytterNavn' ).val();
		navn = titelCase( navn );
		hold = $( '#rytterHold' ).val();

		tilfojRytter(navn, hold);
	});

	// Vis opfordring (første gang) til at trykke enter, når alle værdier er udfyldt
	var showEnterAlert = true; // Sættes til 'false' når rytter tilføjes med tryk på enter (se længere oppe)
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #brost, #bjerg' ).on('change', function() {
		if ( rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0 && $('.checkboxes input:radio:checked').length > 0 ) {
			if ( showEnterAlert === true ) {
				$('.alerts').append('<h4 class="alert alert-warning col-sm-8">Hit enter!</h4>');
			}
		}
		$('.alert').delay(3000).fadeOut();
	});

	// Slet rytter både fra DOM og Firebase ved tryk på rød knap i hver <li>
	$( '.container' ).on( 'click', '#sletRytter', function() {
		var rytter = $( this ).closest('li'); // Find tættest li
		var rytterMeta = rytter.text(); // Træk teksten ud af dette li
		var rytterNavn = rytterMeta.slice(0, rytterMeta.indexOf(',')); // Træk navn ud af text node (hent string indtil komma)
		var rytterGrp = rytter.closest('ul'); // Find gruppen denne li er del af
		var rytterGrpId = rytterGrp.attr('id'); // Træk ID'et på denne gruppe ud

		rytter.remove(); // Fjern rytter fra DOM

		// Slet rytter fra Firebase
		if ( rytterGrpId === 'tempoGrp' ) {
			ryttereTempoRef.child(rytterNavn).remove();
		}
		else if ( rytterGrpId === 'sprintGrp' ) {
			ryttereSprintRef.child(rytterNavn).remove();
		}
		else if ( rytterGrpId === 'brostGrp' ) {
			ryttereBrostRef.child(rytterNavn).remove();
		}
		else if ( rytterGrpId === 'bjergGrp' ) {
			ryttereBjergRef.child(rytterNavn).remove();
		}
	});

	/* ----- Vis/skjul kategori-lister ----- */

	var visListe = function( listeOverskrift ) {
		$( listeOverskrift ).on( 'click', function () {
			var pil = $( this ).children( '.fa-pil' );
			pil.toggleClass( 'fa-chevron-down fa-chevron-left');
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
	var bjergGrpTitle = '#bjergGrpTitle';

	visListe( tempoGrpTitle );
	visListe( sprintGrpTitle );
	visListe( brostGrpTitle );
	visListe( bjergGrpTitle );

	/* ----- / Vis/skjul kategori-lister ----- */

	// Sortérbar [jQuery UI]
	$( '#tempoGrp, #sprintGrp, #brostGrp, #bjergGrp' ).sortable({
		// connectWith: '.connectedSortable'
		// Implementér sortering mellem grupper, når det er sat op med Firebase
	});




});