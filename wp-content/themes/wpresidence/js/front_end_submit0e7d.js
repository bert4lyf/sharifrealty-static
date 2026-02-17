/*global  jQuery, document ,ajaxcalls_vars,Modernizr,google,map,control_vars,dashboard_vars*/
// front property submit page-template-front_property_submit
jQuery(document).ready(function ($){
    "use strict";
	jQuery('.loginpop').val('3');
 
	wpestate_front_end_submit_navigation_actions();   
	wpestate_front_end_submit_property_action();
	wpestate_front_end_submit_navigation_actions();
    wpestate_front_end_next_step_action();    
	wpestate_front_end_prev_step_action();
         
});


/*
*
*  process prev step
*
*/

function wpestate_front_end_prev_step_action(){
		// process prev step action
		jQuery('#front_submit_prev_step').on('click', function(e){ 
			var current_step = parseInt( jQuery('.page-template-front_property_submit #current_step').val() );
			 
			if( current_step <= 5 ){
				jQuery('.page-template-front_property_submit .step_'+current_step).hide();
				current_step--;
				
				// innner navigaton
				jQuery('.page-template-front_property_submit .inner_navigation').removeClass('active');
				jQuery('.page-template-front_property_submit .navigation_'+current_step).addClass('active');
				jQuery('.page-template-front_property_submit #current_step').val( current_step );
				jQuery('.page-template-front_property_submit .step_'+current_step).show();
				jQuery('#front_submit_next_step').show();
				if (typeof (google) !== 'undefined') {
					google.maps.event.trigger(map, 'resize');
				}
				
				jQuery('.page-template-front_property_submit #submit_property').hide();
			}
			if( current_step == 1 ){
				jQuery('#front_submit_prev_step').hide();
				jQuery('#front_submit_next_step').show();
				jQuery('.page-template-front_property_submit #submit_property').hide();
			}
		});
		
}


/*
*
*  process next step
*
*/


function wpestate_front_end_next_step_action(){
	// process next step action
	jQuery('#front_submit_next_step').on('click', function(e){ 
		var current_step = parseInt( jQuery('.page-template-front_property_submit #current_step').val() );	
               
		if( current_step < 5 ){
			jQuery('.page-template-front_property_submit .step_'+current_step).hide();
			current_step++;
			
			// innner navigaton
			jQuery('.page-template-front_property_submit .inner_navigation').removeClass('active');
			jQuery('.page-template-front_property_submit .navigation_'+current_step).addClass('active');
			
			jQuery('.page-template-front_property_submit #current_step').val( current_step );
			jQuery('.page-template-front_property_submit .step_'+current_step).show();
			jQuery('#front_submit_prev_step').show();
						
			if (typeof (map) !== 'undefined') {
				if(wp_estate_kind_of_map===1){
					google.maps.event.trigger(map, "resize");
				}else if(wp_estate_kind_of_map===2){
					map.invalidateSize();
				}
			}



			jQuery('.page-template-front_property_submit #submit_property').hide();
		}
		if( current_step == 5 ){
			jQuery('#front_submit_next_step').hide();
			jQuery('.page-template-front_property_submit #submit_property').show();

            }
	});
	
}

/*
*
*  process submit
*
*/


function wpestate_front_end_submit_property_action(){
	jQuery('.page-template-front_property_submit #submit_property').on('click',function(event){
		event.preventDefault();

		if (parseInt(ajaxcalls_vars.userid, 10) === 0 ) {
			jQuery('.login-links').hide();

			if (jQuery('.step_5').is(':visible')) {
				if (!Modernizr.mq('only all and (max-width: 768px)')) {
					jQuery("#modal_login_wrapper").show(); 
				}else{
					jQuery('.mobile-trigger-user').trigger('click');
				}                      
			}else{
			//
			}


		}else{
			jQuery('#front_submit_form').submit();
		}
	});
}



/*
*
*  inner navigation processing
*
*/

function wpestate_front_end_submit_navigation_actions(){

		jQuery('.inner_navigation').on('click', function(e){ 
			e.preventDefault();
			var current_step = parseInt( jQuery('.page-template-front_property_submit #current_step').val() );	
			jQuery('.page-template-front_property_submit .step_'+current_step).hide();
			
			var id = parseInt( jQuery(this).attr('data-id') );
		 
			  
			 
			jQuery('.page-template-front_property_submit .step_'+id).fadeIn();
			jQuery('.page-template-front_property_submit .inner_navigation').removeClass('active');
			jQuery(this).addClass('active');
			jQuery('.page-template-front_property_submit #current_step').val( id );
		
			if( id < 7 ){
						
				jQuery('#front_submit_prev_step').show();
				jQuery('#front_submit_next_step').show();
	
				if (typeof (map) !== 'undefined') {
					if(mapfunctions_vars.geolocation_type==1){
						google.maps.event.trigger(map, 'resize');
					}else{
						setTimeout(function(){       map.invalidateSize(); }, 600);   
					}
				}
				jQuery('.page-template-front_property_submit #submit_property').hide();
			}
			if( id == 5 ){
					  
				jQuery('#front_submit_next_step').hide();
				jQuery('.page-template-front_property_submit #submit_property').show();
			}
			if( id == 1 ){
						
				jQuery('#front_submit_prev_step').hide();
				jQuery('#front_submit_next_step').show();
				jQuery('.page-template-front_property_submit #submit_property').hide();
			}
		});
}