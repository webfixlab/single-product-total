/**
 * Frontend JS for Single Product Total
 *
 * @version 1.0.0
 * @package Single Product Total
 */

;(function($, window, document){
	class ProductTotalNew{
		constructor(){
			const self = this;

			this.$working    = false;
			this.$priceWrap  = $(document).find('.sptotal-price');
			this.$totalPrice = this.$priceWrap.find('.total-price');
			this.$cartBtn    = $(document).find('form.cart .single_add_to_cart_button');

			$(document).ready(function(){
				setTimeout(function(){
					self.init();
				}, sptotal_data.settings.delay);
			});
		}
		init(){
			const self = this;

			this.handleOtherTriggers();
			this.updateTotal();

			$(document).on('change input', 'form.cart .quantity .qty', function(){
				console.log('qt changed');
				if(!self.$working ){
					self.$working = true;
					self.updateTotal();
				}
			});
			$(document).on('click', '.minus, .plus', function(){
				if(!self.$working ){
					self.$working = true;
					self.updateTotal();
				}
			});
			$(document).on('click', '.sptotal-cart-btn', function(){
				if(!self.$working ){
					self.$working = true;
					self.$cartBtn.trigger('click');
				}
			});

			this.persistantEventHandler();
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
		}



		updateTotal(){
			const self = this;

			let disableCart = false;
			this.loaderAnimation(this.$priceWrap, 'start');
			setTimeout(function(){
				const total = self.calculateTotalPrice();
				if(total === 0) disableCart = true;
				self.$totalPrice.text(self.parsePrice(total, 'front'));

				self.loaderAnimation(self.$priceWrap, 'stop');
				self.$working = false;
			}, parseInt(sptotal_data.settings.delay));

			// console.log('[updateTotal]');
			this.cartBtnHandler(disableCart);
		}
		calculateTotalPrice(){
			const self = this;

			let total  = 0.00;
			const qtys = $(document).find('form.cart .quantity .qty');
			if(qtys.length > 1){
				$.each(qtys, function (index, item){
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
				const qty   = qtys.val();
				if(qty.length > 0 && price.length > 0){
					total += (parseFloat(price) * parseInt(qty));
				}
			}
			return this.checkForIssues() ? 0.00 : total;
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
		checkForIssues(){
			let hasIssue = false;
			// check if all variations are selected.
			const wrap = this.getVariationsWrap();
			if(wrap.length){
				let total = 0, selected = 0;
				wrap.find('select[name^="attribute_"]').each(function (index, item){
					total++;
					if($(item).find('option:selected').val().length > 0){
						selected++;
					}
				});
				// console.log('has issue?', total, selected );
				if(total !== selected) hasIssue = true;
			}

			// check if variation add to cart button is enabled or not.
			const cartBtn = $(document).find('.woocommerce-variation-add-to-cart');
			// console.log('cart btn', cartBtn);
			if(cartBtn && cartBtn.hasClass('woocommerce-variation-add-to-cart-disabled')){
				// console.log('cart btn disabled');
				return true;
			}
			return hasIssue;
		}
		getVariationsWrap(){
			let wrap = $(document).find('table.variations');
			if(wrap.length === 0){
				wrap = $(document).find('.variations_form');
			}
			return wrap.length > 0 ? wrap : false;
		}

		loaderAnimation(item, action = 'start'){
			const key     = 'sptotal';
			const aniWrap = $(document).find(`.sptotal .${key}-loading`); // animation wrapper.
			// console.log('[spinner:item]', item);
			if(action === 'start'){
				if(!item.hasClass(`${key}-disable`)){
					item.addClass(`${key}-disable`);
				}
				if(typeof aniWrap === undefined || aniWrap.length === 0){
					item.before(`<div class="${key}-loading"></div>`);
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





		persistantEventHandler(){
			const self = this;

			$(document).on('change', '.variations select', function(){
				// console.log('[select:changed]');
				// console.log('[select:changed]', $(this).attr('name'));
				if($(this).find('option:selected').val().length === 0){
					self.resetTotal();
					self.cartBtnHandler(true);
				}else{
					self.cartBtnHandler();
				}
			});
			$(document).on('click', 'a.reset_variations', function(){
				// console.log('[reset:clicked]');
				self.resetTotal();
				self.cartBtnHandler(true);
			});
		}
		resetTotal(){
			this.$totalPrice.text(this.parsePrice(0, 'front'));
		}
		cartBtnHandler(override = false){
			const totalCartBtn = $(document).find('.sptotal-cart-btn');
			if(!totalCartBtn) return;

			if(override && !totalCartBtn.hasClass('sptotal-disable')){
				// console.log('[override:cart - disable]');
				totalCartBtn.addClass('sptotal-disable');
			}
			if(override) return;

			setTimeout(function(){
				const cartBtn   = $(document).find('.woocommerce-variation-add-to-cart');
				const isDisable = cartBtn && cartBtn.hasClass('woocommerce-variation-add-to-cart-disabled');
				// console.log('cart btn disable?', isDisable);
				if(isDisable && !totalCartBtn.hasClass('sptotal-disable')) totalCartBtn.addClass('sptotal-disable');
				else totalCartBtn.removeClass('sptotal-disable');
			}, sptotal_data.settings.delay);
		}
	}
	new ProductTotalNew();
})(jQuery, window, document);