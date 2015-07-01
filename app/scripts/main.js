$(document).ready(function() {

	'use strict';

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
		console.log();
		var rytterHTML = '<li>' + name;
		var delBtn = ' <span id="sletRytter"><i class="fa fa-remove"></i></span>';
		if ( team !== '' ) { rytterHTML += ', ' + team + delBtn + '</li>'; }
		else { rytterHTML += delBtn + '</li>'; }
		return rytterHTML;
	};

	// Tilføj rytter ved tryk på enter
	$( '#rytterNavn, #rytterHold, #tempo, #sprint, #bjerg' ).keyup( function(e) {
		// Når der trykkes enter i inputs...
		if ( e.keycode === 13 || e.which === 13 ) {
			// Dan HTML for en rytter
			var rytter = tilfojRytter();

			// Gem inputs i variabler
			var rytterNavnInput = $( '#rytterNavn' );
			var rytterHoldInput = $( '#rytterHold' );

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

			// Gem kategori checkboxes i variabler
			var tempo = $( '#tempo' );
			var sprint = $( '#sprint' );
			var bjerg = $( '#bjerg' );

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
				$('.header').append('<h4 class="alert alert-warning">Du skal lige udfylde flere felter, du!</h4>');
				$('.alert').delay(3000).fadeOut();
			}
		}
	});

	// Slet rytter-knap ved hver <li>
	$( '.container' ).on( 'click', '#sletRytter', function() {
		$( this ).closest('li').remove();
	});

	// Sortérbar
	$( '#tempoGrp, #sprintGrp, #bjergGrp' ).sortable();




});