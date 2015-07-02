$(document).ready(function() {

	'use strict';

  var firebaseURL = 'https://glaring-torch-9804.firebaseio.com/';
  var databRef = new Firebase( firebaseURL );
  // Sæt referencer op til de forskellige grene af databasen
  var ryttereTempoRef = databRef.child( 'ryttere/tempo' );
  var ryttereSprintRef = databRef.child( 'ryttere/sprint' );
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
	// Hent tempo ryttere
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

	// Hent sprint ryttere
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

	// Hent bjerg ryttere
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

	var tilfojRytter = function() {
		// Dan HTML for en rytter
		var rytter = bygRytter(navn, hold);
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
		else if ( bjerg.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0) {
			$( '#bjergGrp' ).append( rytter );
      ryttereBjergRef.child( navn ).set({
        hold: hold
      });
			resetInputs();
			bjerg.prop('checked', false);
			selectNameInput();
		} else { // Ellers giv en advarsel om at der mangler at blive udfyldt inputs
			$('.alerts').append('<h4 class="alert alert-warning col-sm-6">Udfyld lige alle felter, du!</h4>');
			$('.alert').delay(3000).fadeOut();
		}
	};

	// Tilføj rytter ved tryk på enter
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #bjerg' ).keyup( function(e) {
		navn = $( '#rytterNavn' ).val();
		hold = $( '#rytterHold' ).val();

		// Filtrer input, så første bogstav bliver stort, resten småt
		var titelCase = function(txt) {
		  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		};
		navn = titelCase( navn );

		// Når der trykkes enter i inputs...
		if ( e.keycode === 13 || e.which === 13 ) {
			tilfojRytter();
		}
	});

	// Mobil: Tilføj ved tryk på knap 'Tilføj rytter'
	$( '#btnTilfojMobil' ).on('click', function () {
		tilfojRytter();
	});

	// Vis opfordring (første gang) til at trykke enter, når alle værdier er udfyldt
	var showEnterAlert = true; // Sættes til 'false' når rytter tilføjes med tryk på enter (se længere oppe)
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #bjerg' ).on('change', function() {
		if ( rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0 && $('.checkboxes input:radio:checked').length > 0 ) {
			if ( showEnterAlert === true ) {
				$('.alerts').append('<h4 class="alert alert-warning col-sm-6">Hit enter!</h4>');
			}
		}
		$('.alert').delay(3000).fadeOut();
	});

	// Slet rytter-knap ved hver <li>
	$( '.container' ).on( 'click', '#sletRytter', function() {
		$( this ).closest('li').remove();
	});

	// Sortérbar [jQuery UI]
	$( '#tempoGrp, #sprintGrp, #bjergGrp' ).sortable({
		// connectWith: '.connectedSortable'
		// Implementér sortering mellem grupper, når det er sat op med Firebase
	});




});