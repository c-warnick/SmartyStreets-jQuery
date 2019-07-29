/*
  SmartyStreets-jQuery.js
  Smarty Streets jQuery Plugin
  by Charles Warnick - charles.warnick@outlook.com

  Copyright (c) 2019 MooreCreative Company

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/

if (typeof jQuery === 'undefined') {
  throw new Error('Smarty Street jQuery Plugin requires jQuery')
}

if (typeof SmartyStreetsSDK === 'undefined') {
  throw new Error('Smarty Street jQuery Plugin requires Smarty Streets SDK')
}

function getSmartyJqueryWebKey() {
  var smartyScript = document.getElementsByName('SmartyStreets-jQuery');
  var script = smartyScript[0];

  return script.getAttribute('websiteKey');
}

(function($){
  // SmartyJQ CLASS DEFINITION
  // =======================
  var Smarty = function(element, options) {
    
    this.options = $.extend({},Smarty.DEFAULTS, options);

    this.$element = $(element);
    this.id = this.$element.attr('id');
    this.multiField = false;
    this.fieldArray = this.$element.data('smarty');
    if(this.fieldArray && this.fieldArray.split(',').length > 0){
      this.multiField = true;
      this.fields = $('');
      var _this = this;
      this.fieldArray.split(',').forEach(function(item){
        console.log(item)
        _this.fields = _this.fields.add($("[id$='"+item+"']"))
      })
    }
    this.websiteKey = this.options.websiteKey ||  getSmartyJqueryWebKey();

    this.currentFocus;

    if(this.websiteKey && this.websiteKey.length){
      
      this.credentials = new SmartyStreetsSDK.core.SharedCredentials(this.websiteKey)
      if(this.options.autoLookup && this.credentials){
        
        this.autoLookup = SmartyStreetsSDK.usAutocomplete.Lookup
        this.autoClient = SmartyStreetsSDK.core.buildClient.usAutocomplete(this.credentials)
      }
      if(this.options.usLookup && this.credentials){
        
        this.usLookup = SmartyStreetsSDK.usStreet.Lookup
        this.usClient = SmartyStreetsSDK.core.buildClient.usStreet(this.credentials)
      }
    } else {
      this.$element.before('<div class="alert alert-danger" role="alert">Please pass your website key in plugin options. By setting window.smartyWebsiteKey or passing the key through the initializier function.')
    }

    //Handlers
    this.$element
      .on('input',$.proxy(this.handleInput,this))
      .on("keydown", $.proxy(this.handleKeydown,this))

    //Initializers
    this.$element.wrap('<div class="autocomplete"></div>');
    this.$autoComplete = this.$element.parent();

    $(document).on("click", $.proxy(this.closeAllLists,this));
  }

  Smarty.VERSION = "1.0.0";
  Smarty.DEFAULTS = {
    autoLookup: true,
    usLookup:true,
    websiteKey:"",
  };

  Smarty.prototype.handleInput = function(e){
    
    var _this = this;
    var val = _this.$element.val();
    /*close any already open lists of autocompleted values*/
    _this.closeAllLists();
    if (!val) { return false;}
    _this.currentFocus = -1;
    
    var autoLookup = new _this.autoLookup(val);

    _this.autoClient
    .send(autoLookup)
    .then($.proxy(_this.buildSuggestions,_this))
    .catch(console.log);
  }

  Smarty.prototype.handleKeydown = function(e){
    var _this = this;
    var x = document.getElementById(_this.id + "autocomplete-list");
    
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      _this.currentFocus++;
      /*and and make the current item more visible:*/
      _this.addActive(x);
    } else if (e.keyCode == 38) { 
      
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      _this.currentFocus--;
      /*and and make the current item more visible:*/
      _this.addActive(x);
    } else if (e.keyCode == 13) {
      
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (_this.currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[_this.currentFocus].click();
      }
    } else if(e.keyCode == 9){
      
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      
      _this.closeAllLists();
    }
  }

  Smarty.prototype.populateFields = function(response){
    
    var _this = this;
    //
    response = response.lookups[0];
    var result = response.result;
    //
    if(result.length > 1){
      //TODO: Handle Multiple Suggestions.
    }else if(result.length === 1){
      var address = result[0],
          components = address.components;
      if(address && components){
        console.log("Is Multifields", _this.multiField)
        if(_this.multiField){
          _this.$element.val(address.deliveryLine1 ? address.deliveryLine1 : "");
          _this.fields.each(function(){
            var $this = $(this);
            $this.val(_this.mappedValueToField($this.attr('id'),address,components));
          })
        }else{
          _this.$element.val(_this.concatenateAddress(address,components));
        }
      }
    }
  }

  Smarty.prototype.concatenateAddress = function(address,components){
    var addressOne = address.deliveryLine1 ? address.deliveryLine1 : "",
        addressTwo = address.deliveryLine2 ? address.deliveryLine2 : "",
        city = components.cityName? components.cityName:"",
        state = components.state ? components.state :"",
        zip = components.zipCode? components.zipCode:"";

    return addressOne + " " + addressTwo + " " + city + "," + state + " " + zip; 
  }

  Smarty.prototype.mappedValueToField = function(id,address,components){
    var _id = id.toUpperCase();
    
    var val;
    _id.indexOf('ADDRESSONE') > -1 ?
      val =  address.deliveryLine1 ? address.deliveryLine1 : "" : 
    _id.indexOf('ADDRESSTWO') > -1 ?
      val =  address.deliveryLine2 ? address.deliveryLine2 : "":
    _id.indexOf('CITY') > -1 ?
      val = components.cityName? components.cityName:"" :
    _id.indexOf('STATE') > -1 ? 
      val = components.state ? components.state :"":
    _id.indexOf('ZIP') > -1 ?
      val = components.zipCode? components.zipCode:"" : 
    null;

    return val;
  }

  Smarty.prototype.validateAddressAndApply = function(street){
    
    var _this = this;
    //console.log("validateAddressAndApply params",street)
    street = JSON.parse(street);
    //
    if(!street || typeof street != 'object'){
      console.warn("Passed street is not a valid object");
      return false;
    }
    
    var usLookup = new _this.usLookup();
    
    usLookup.street = street.streetLine;
    usLookup.city = street.city;
    usLookup.state = street.state;
    usLookup.maxCandidates = 3;
    usLookup.match = "invalid";
    
    
    _this.usClient.send(usLookup)
          .then($.proxy(_this.populateFields,_this))
          .catch(console.log);
  }

  Smarty.prototype.buildSuggestions = function(response,val,id){

    var _this = this;   
    if(response.result && !Array.isArray(response.result)){
      console.warn("Incorrect response returned");
      return false;
    }
    
    var a, b, i,arr = response.result;
    val = val || _this.$element.val();
    id = id || _this.id;
    
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    _this.$autoComplete.append(a);
    for (i = 0; i < arr.length; i++) {
        /*create a DIV element for each matching element:*/
        var address = arr[i]
        b = document.createElement("DIV");
        b.innerHTML += address.text;
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + JSON.stringify(address) + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            _this.validateAddressAndApply(this.getElementsByTagName("input")[0].value);
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
              _this.closeAllLists();
        });
        a.appendChild(b);
    }
  }

  Smarty.prototype.addActive = function(x) {
    
    var _this = this;
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    _this.removeActive(x);
    if (_this.currentFocus >= x.length) _this.currentFocus = 0;
    if (_this.currentFocus < 0) _this.currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[_this.currentFocus].classList.add("autocomplete-active");
  }

  Smarty.prototype.removeActive = function(x) {
    
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  Smarty.prototype.closeAllLists = function(elmnt) {
    
    var _this = this;
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != _this.$element.get(0)) {
        x[i].parentNode.removeChild(x[i]);
      }
    }

    return;
  }
  // Quote PLUGIN DEFINITION
	// ==========================
	function Plugin(option) {
		return this.each(function() {
			var $this = $(this)
      var data = $this.data('jQ.smarty')
      var options = $.extend({}, Smarty.DEFAULTS, $this.data(), typeof option == 'object' && option)
			if (!data) $this.data('jQ.smarty', (data = new Smarty(this, options)))
		})
	}
	var old = $.fn.Smarty
	$.fn.smarty = Plugin
	$.fn.smarty.Constructor = Smarty
	// Quote NO CONFLICT
	// ====================
	$.fn.smarty.noConflict = function() {
		$.fn.smarty = old
		return this
	}

	$(document).ready(function() {
		$('[data-smarty]').each(function() {
			var $el = $(this)
			Plugin.call($el, $el.data())
		})
  })
  
  
})(jQuery);