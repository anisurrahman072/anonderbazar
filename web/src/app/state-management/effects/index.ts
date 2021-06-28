import {CurrentUserEffect} from "./current-user.effect";
import {CartEffects} from "./cart.effect";
import {FavouriteProductEffects} from "./favourite-product.effect";
import {CompareProductEffects} from "./compare-product.effect";
import {OfferEffect} from "./offer.effect";
//
export const effects: any[] = [CartEffects, CurrentUserEffect, FavouriteProductEffects, CompareProductEffects, OfferEffect];

export * from './current-user.effect';
export * from './cart.effect';
export * from './favourite-product.effect';
export * from './compare-product.effect';
export * from './offer.effect';
