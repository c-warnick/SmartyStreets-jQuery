# SmartyStreets-jQuery
jQuery plugin for Smart Streets API

<div class="page-header">
  <h1>Smarty Street jQuery Plugin</h1>
  <div class="panel panel-default">
  <div class="panel-heading"><h4>How to implement Smarty Street Plugin</h4></div>
  <div class="panel-body">
    <p>
			When implementing the Smarty Stree Plugin two script tags must be added.
    </p>
    <pre>&lt;script src="https://d79i1fxsrar4t.cloudfront.net/sdk/1.4.0/smartystreets-sdk-1.4.0.min.js"&gt;&lt;/script&gt;
         &lt;script name="SmartyStreets-jQuery" src="/Scripts/SmartyStreets-jQuery.js?ver=1" websiteKey='&lt;WebsiteKey&gt;'&gt;&lt;/script&gt;</pre>
    <p>The smartystreets-sdk script must be placed in the header and the SmartyStreets-jQuery tag must be placed just above the closing body tag with the SmartyStreets WebsiteKey passed as a parameter.</p>
    <p>The plugin has been design to be initiated through a jQuery chain call.</p>
    <pre>$('field').Smarty();</pre>
    <p>
			or through a data attribute on html nodes (recommended)
    </p>
    <pre>&lt;input type="text" id="txtAddressOne" datafield="AddressOne" Placeholder="Address 1" autocomplete="new-password" data-smarty="txtAddressTwo,txtCity,txtState,txtZip"/&gt;</pre>
    <p>
			The data-smarty attribute utilizes comma delimited list of other field. The field ids must match the ids of the fields you want to populate and also contain on of the following strings "AddressOne","AddressTwo","City","State","Zip" to map address values correctly. However, if the attribute is left blank the values will be concatenated into the initalizing field.
    </p>
  </div>
</div>
</div>
