var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

function klicGeneriranjaPodatkov() {
    jQuery.ajaxSetup({async: false});
    generirajPodatke(1);
    generirajPodatke(2);
    generirajPodatke(3);
    jQuery.ajaxSetup({async: true});
}

function generirajPodatke(stPacienta) {
    ehrId = "";

    sessionId = getSessionId();
	
	var ime = "";
	var priimek = "";
	var datumRojstva = "";
	var najblizjeMesto = "";

    switch (stPacienta){
        case 1: {
            ime = "Peter";
            priimek = "Vzorčni";
            datumRojstva = "1980-01-02T15:15";
            najblizjeMesto = "Celje";
            break;
        }
        case 2: {
            ime = "Ana";
            priimek ="Vzorec";
            datumRojstva = "1965-05-05T13:44";
            najblizjeMesto = "Koper";
            break;
        }
        case 3: {
            ime = "Tihomir";
            priimek = "Testni";
            datumRojstva = "1966-10-05T11:15";
            najblizjeMesto = "Ljubljana";
            break;
        }
        default: {
            ime = "Ana";
            priimek ="Vzorec";
            datumRojstva = "1965-05-05T13:44";
            najblizjeMesto = "Koper";
            break;
        }
    }
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            address: {
		            	address: najblizjeMesto
		            },
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    var sporociId = document.getElementById('prazen');
		                    sporociId.innerHTML += "<span class='obvestilo " +
                          "label label-success fade-in'><br>Testni EhrId je: '" +
                          ehrId + "'.</span>";
                          generirajMeritveVitalnihZnakov(ehrId, stPacienta);
		                }
		            },
		            error: function(err) {
		            	$("#menujska-vrstica").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka pri generiranju! '" +
                    JSON.parse(err.responseText).userMessage + "'!");
		            }
		        });
		    }
		});

  return ehrId;
}

function generirajMeritveVitalnihZnakov(ehrId, stPacienta) {
    switch (stPacienta) {
        case 1: {
            vnosGeneriranihPodatkov(ehrId, "2015-03-03T15:15", 190, 81.00, 36.50, 118, 91, 99);
            vnosGeneriranihPodatkov(ehrId, "2015-03-04T15:15", 190, 81.50, 36.50, 120, 92, 99);
            vnosGeneriranihPodatkov(ehrId, "2015-03-05T15:15", 190, 81.90, 37.00, 118, 91, 99);
            break;
        }
        case 2: {
            vnosGeneriranihPodatkov(ehrId, "2014-04-04T15:15", 178, 71.00, 33.50, 125, 91, 99);
            vnosGeneriranihPodatkov(ehrId, "2014-04-05T10:15", 178, 71.50, 34.50, 129, 92, 97);
            vnosGeneriranihPodatkov(ehrId, "2014-04-06T17:15", 178, 71.90, 35.00, 129, 91, 98);
            break;
        }
        case 3: {
            vnosGeneriranihPodatkov(ehrId, "2013-06-07T13:15", 171, 93.00, 38.50, 121, 91, 99);
            vnosGeneriranihPodatkov(ehrId, "2013-02-08T14:15", 171, 93.50, 37.50, 120, 92, 98);
            vnosGeneriranihPodatkov(ehrId, "2013-01-09T15:15", 171, 93.90, 37.00, 118, 91, 96);
            break;
        }
    }
}

function vnosGeneriranihPodatkov(ehrId, datumInUra, telesnaVisina, telesnaTeza, telesnaTemperatura, sistolicniKrvniTlak, diastolicniKrvniTlak, nasicenostKrviSKisikom) {
    sessionId = getSessionId();
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        console.log("Success!");
		    },
		    error: function(err) {
		    	$("#menujska-vrstica").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka pri generiranju podatkov! '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
	}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

  window.onload = function () {
    var chart = AmCharts.makeChart("chartdiv", {
    "type": "serial",
	"theme": "dark",
    "legend": {
        "horizontalGap": 10,
        "maxColumns": 1,
        "position": "right",
		"useGraphSettings": true,
		"markerSize": 10
    },
    "dataProvider": [{
        "mesto": "Ljubljana",
        "lekarne": 20.0,
        "bolnisnice": 1.0,
        "zobozdravniki": 20.0,
    }, {
        "mesto": "Maribor",
        "lekarne": 16.0,
        "bolnisnice": 3.0,
        "zobozdravniki": 20.0,
    }, {
        "mesto": "Kranj",
        "lekarne": 10.0,
        "bolnisnice": 1.0,
        "zobozdravniki": 12.0,

    }, {
        "mesto": "Celje",
        "lekarne": 12.0,
        "bolnisnice": 1.0,
        "zobozdravniki": 14.0,
    }, {
        "mesto": "Ptuj",
        "lekarne": 5.0,
        "bolnisnice": 1.0,
        "zobozdravniki": 12.0,
    }, {
        "mesto": "Slovenj Gradec",
        "lekarne": 2.0,
        "bolnisnice": 1.0,
        "zobozdravniki": 3.0,
    }, {
        "mesto": "Koper",
        "lekarne": 8.0,
        "bolnisnice": 1.0,
        "zobozdravniki": 20.0,
    }, {
        "mesto": "Novo mesto",
        "lekarne": 8.0,
        "bolnisnice": 3.0,
        "zobozdravniki": 15.0,
    }, {
        "mesto": "Nova Gorica",
        "lekarne": 8.0,
        "bolnisnice": 1.0,
        "zobozdravniki": 13.0,
    }, {
        "mesto": "Kamnik",
        "lekarne": 5.0,
        "bolnisnice": 1.0,
        "zobozdravniki": 3.0,
    }],
    "valueAxes": [{
        "stackType": "regular",
        "axisAlpha": 0.3,
        "gridAlpha": 0
    }],
    "graphs": [{
        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
        "fillAlphas": 0.8,
        "labelText": "[[value]]",
        "lineAlpha": 0.3,
        "title": "Lekarne",
        "type": "column",
		"color": "#000000",
        "valueField": "lekarne"
    }, {
        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
        "fillAlphas": 0.8,
        "labelText": "[[value]]",
        "lineAlpha": 0.3,
        "title": "Bolnišnice",
        "type": "column",
		"color": "#000000",
        "valueField": "bolnisnice"
    }, {
        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
        "fillAlphas": 0.8,
        "labelText": "[[value]]",
        "lineAlpha": 0.3,
        "title": "Zobozdravniki",
        "type": "column",
		"color": "#000000",
        "valueField": "zobozdravniki"
    }],
    "categoryField": "mesto",
    "categoryAxis": {
        "gridPosition": "start",
        "axisAlpha": 0,
        "gridAlpha": 0,
        "position": "left"
    },
    "export": {
    	"enabled": true
     }

});
}

