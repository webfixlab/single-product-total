/**
 * Frontend JS for Single Product Total
 *
 * @version 1.0.0
 * @package Single Product Total
 */

;(function($, window, document){
	class ProductTotalNew{
		constructor(){
			this.$working    = false;
			this.$priceWrap  = $(document).find('.sptotal-price');
			this.$totalPrice = this.$priceWrap.find('.total-price');
			this.$cartBtn    = $(document).find('form.cart .single_add_to_cart_button');

			$(document).ready(() => {
				this.init();
			});
			this.$working = this.$working;
		}
		init(){
			this.$working = true;
			this.handleOtherTriggers();
			this.updateTotal();

			$(document).on('change input', 'form.cart .quantity .qty', () => {
				if(!this.$working ){
					this.$working = true;
					this.updateTotal();
				}
			});
			$(document).on('click', '.minus, .plus', () => {
				if(!this.$working ){
					this.$working = true;
					this.updateTotal();
				}
			});
			$(document).on('click', '.sptotal-cart-btn', () => {
				if(!this.$working ){
					this.$working = true;
					this.$cartBtn.trigger('click');
				}
			});
		}
		handleOtherTriggers(){
			const self = this;

			// handle variations swatches.
			const swatch = self.getSwatches();
			swatch.each(function(){
				$(this).on('click', function(){
					if(!self.$working ){
						self.$working = true;
						self.updateTotal();
					}
				});
			});
			// this.$working = this.$working;

			// handle YITH Dynamic Pricing.
			const tables = $(document).find('.ywdpd-quantity-table');
			if(tables.length > 0){
				tables.each(function(){
					$(this).find('td').each(function(){
						$(this).on('click', function(){
							if(!self.$working ){
								self.$working = true;
								self.updateTotal();
							}
						});
					});
				});
			}
			// this.$working = self.$working;
		}
		updateTotal(){
			this.loaderAnimation(this.$priceWrap, 'start');
			setTimeout(() => {
				const total = this.calculateTotalPrice();
				this.$totalPrice.text(this.parsePrice(total, 'front'));

				this.loaderAnimation(this.$priceWrap, 'stop');
				this.$working = false;
			}, parseInt(sptotal_data['settings']['delay']));
			// this.$working = this.$working;
		}
		calculateTotalPrice(){
			const self = this;

			let total        = 0.00;
			const quantities = $(document).find('form.cart .quantity .qty');
			if(quantities.length > 1){
				$.each(quantities, function (index, item){
					const wrap  = $(item).closest('.woocommerce-grouped-product-list-item').find('.woocommerce-grouped-product-list-item__price');
					const price = self.parsePrice(self.getPriceText(wrap), 'back');
					const qty   = $(item).val();
					if(qty.length > 0 && price.length > 0){
						total += (parseFloat(price) * parseInt(qty));
					}
				});
			} else {
				let wrap = $(document).find('.single_variation_wrap');
				if(wrap.length !== 0){
					wrap = wrap.find('.woocommerce-variation-price');
				} else {
					wrap = $(document).find('.wp-block-columns .wp-block-woocommerce-product-price');
				}
				wrap = wrap.length === 0 || wrap.text().length === 0 ? $(document).find('p.price') : wrap;

				const price = this.parsePrice(this.getPriceText(wrap), 'back');
				const qty   = quantities.val();
				if(qty.length > 0 && price.length > 0){
					total += (parseFloat(price) * parseInt(qty));
				}
			}
			this.$working = this.$working;
			return this.checkForIssues() ? 0.00 : total;
		}
		checkForIssues(){
			let issues = false;
			// check if all variations are selected.
			const wrap = this.getVariationsWrap();
			if(wrap.length){
				let total = 0, selected = 0;
				wrap.find('select[name^="attribute_"]').each(function (index, item){
					total++;
					if($(item).find('option:selected').val().length){
						selected++;
					}
				});
				// console.log('checkForIssues', total, selected );

				if(total !== selected){
					issues = true;
				}
			}
			return issues;
		}
		getPriceText(wrap){
			if(wrap === undefined || 0 === wrap.length){
				return '';
			}

			let text = '';
			if(wrap.find('ins .woocommerce-Price-amount').length){
				text = wrap.find('ins .woocommerce-Price-amount').last().text();
			} else if(wrap.find('.woocommerce-Price-amount').not('del .woocommerce-Price-amount').length){
				text = wrap.find('.woocommerce-Price-amount').not('del .woocommerce-Price-amount').last().text();
			} else {
				text = wrap.find('.woocommerce-Price-amount').last().text();
			}

			return text;
		}
		parsePrice(price, flow='front'){
			if(price === undefined){
				return 0.0;
			}
			if(flow === 'front'){ // parse price to text price.
				price = parseFloat(price).toFixed(sptotal_data['dp']);
				price = price.replace('.', sptotal_data['ds']);
				price = price.replace(/\B(?=(\d{3})+(?!\d))/g, sptotal_data['ts']);
			} else { // parse text to find price.
				price = price.replace(/[^\d.,]/g, ''); // filter out number parts from string.
				price = price.replace(sptotal_data['ts'], ''); // thousand separator.
				price = price.replace(sptotal_data['ds'], '.'); // decimal separator.
			}
			return price;
		}

		loaderAnimation(item, action = 'start'){
			const key     = 'sptotal';
			const aniWrap = item.find(`.${key}-loading`); // animation wrapper.
			if(action === 'start'){
				if(!item.hasClass(`${key}-disable`)){
					item.addClass(`${key}-disable`);
				}
				if(typeof aniWrap === undefined || aniWrap.length === 0){
					item.append(`<div class="${key}-loading"></div>`);
				}
			} else {
				item.removeClass(`${key}-disable`);
				aniWrap.remove();
			}
		}

		getSwatches(){
			let swatches = $(document).find('.wpcvs-term-label'); // WPC variations swatches | WPClever.
			if(swatches.length === 0){
				swatches = $(document).find('.variable-item-contents'); // Variation swatches | Emran Ahmed.
			}
			if(swatches.length === 0){
				swatches = $(document).find('.rtwpvs-term-span'); // Variation swatches | RadiusTheme.
			}
			if(swatches.length === 0){
				swatches = $(document).find('.yith_wccl_value'); // Variation swatches | Yith.
			}
			return swatches;
		}
		getVariationsWrap(){
			let wrap = $(document).find('table.variations');
			if(wrap.length === 0){
				wrap = $(document).find('.variations_form');
			}
			return wrap.length > 0 ? wrap : false;
		}
	}
	new ProductTotalNew();
})(jQuery, window, document);