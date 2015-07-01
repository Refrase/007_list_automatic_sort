$(document).ready(function() {

	'use strict';

	// var Firebase = require('firebase');
	// var firebaseURL = 'https://glaring-torch-9804.firebaseio.com/';
	// var databRef = new Firebase( firebaseURL );
	// // var ryttereRef = databRef.child( 'ryttere' );

	// databRef.set({
	// 	ryttere: {
	// 		tempo: {
	// 			tempo1: {
	// 				navn: 'Martin',
	// 				hold: 'Quick Step'
	// 			}
	// 		},
	// 		sprint: {
	// 			sprint1: {
	// 				navn: 'Matthews',
	// 				hold: 'Orica GE'
	// 			}
	// 		},
	// 		bjerg: {
	// 			bjerg1: {
	// 				navn: 'Contador',
	// 				hold: 'Tinkoff-Saxo'
	// 			}
	// 		}
	// 	}
	// });

	var name;
	var team;

	// Autovælg navneinput
	var nameInput = document.getElementById('rytterNavn');
	nameInput.focus();
	nameInput.select();

	// Byg rytter værdier ud fra indtstning i inputs
	var tilfojRytter = function() {
		name = $( '#rytterNavn' ).val();
		team = $( '#rytterHold' ).val();

		// Filtrer input, så første bogstav bliver stort, resten småt
		var titelCase = function(txt) {
		  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		};
		name = titelCase( name );

		console.log();
		var rytterHTML = '<li>' + name;
		var delBtn = ' <span id="sletRytter"><i class="fa fa-remove"></i></span>';
		if ( team !== '' ) { rytterHTML += ', ' + team + delBtn + '</li>'; }
		else { rytterHTML += delBtn + '</li>'; }
		return rytterHTML;
	};

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

	// Tilføj rytter ved tryk på enter
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #bjerg' ).keyup( function(e) {
		// Når der trykkes enter i inputs...
		if ( e.keycode === 13 || e.which === 13 ) {
			// Dan HTML for en rytter
			var rytter = tilfojRytter();
			showEnterAlert = false;

			// Alt efter hvilken checkbox der er checked OG hvis de andre inputs ikke er tomme, append rytteren given gruppe
			if ( tempo.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0) {
				$( '#tempoGrp' ).append( rytter );
				resetInputs();
				tempo.prop('checked', false);
				selectNameInput();
			}
			else if ( sprint.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0) {
				$( '#sprintGrp' ).append( rytter );
				resetInputs();
				sprint.prop('checked', false);
				selectNameInput();
			}
			else if ( bjerg.is(':checked') && rytterNavnInput.val() !== '' && rytterHoldInput.prop('selectedIndex') !== 0) {
				$( '#bjergGrp' ).append( rytter );
				resetInputs();
				bjerg.prop('checked', false);

			} else { // Ellers giv en advarsel om at der mangler at blive udfyldt inputs
				$('.alerts').append('<h4 class="alert alert-warning col-sm-6">Udfyld lige alle felter, du!</h4>');
				$('.alert').delay(3000).fadeOut();
			}
		}
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

	// Sortérbar
	$( '#tempoGrp, #sprintGrp, #bjergGrp' ).sortable();




});