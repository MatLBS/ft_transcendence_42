import { applyLink } from "./utils.js";

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLAnchorElement;
		applyLink(target, e);
		if (target.tagName === "BUTTON" && target.hasAttribute("data-carousel-button") && target instanceof HTMLButtonElement) {
			handleCarouselButtonClick(target as HTMLButtonElement);
		}
	})
}
function handleCarouselButtonClick(target: HTMLButtonElement) {
	// Détermine l'offset en fonction du bouton cliqué (next ou prev)
	const offset = target.dataset.carouselButton === "next" ? 1 : -1;

	// Trouve l'élément contenant les slides
	const carousel = target.closest("[data-carousel]") as HTMLElement | null;
	if (!carousel) return;

	const slides = carousel.querySelector("[data-slides]") as HTMLElement | null;
	if (!slides) return;

	// Trouve le slide actif
	const activeSlide = slides.querySelector("[data-active]") as HTMLElement | null;
	if (!activeSlide) return;

	// Calcule le nouvel index
	const children = Array.from(slides.children) as HTMLElement[];
	let newIndex: number = children.indexOf(activeSlide) + offset;

	if (newIndex < 0) newIndex = children.length - 1;
	if (newIndex >= children.length) newIndex = 0;

	// Met à jour les attributs data-active
	children[newIndex].dataset.active = "true";
	delete activeSlide.dataset.active;
};

// new FinisherHeader({
// 	"count": 10,
// 	"size": {
// 	  "min": 676,
// 	  "max": 1171,
// 	  "pulse": 0
// 	},
// 	"speed": {
// 	  "x": {
// 		"min": 0.1,
// 		"max": 0.6
// 	  },
// 	  "y": {
// 		"min": 0.1,
// 		"max": 0.6
// 	  }
// 	},
// 	"colors": {
// 	  "background": "#9138e5",
// 	  "particles": [
// 		"#ff4848",
// 		"#000000",
// 		"#2235e5",
// 		"#000000",
// 		"#ff0000"
// 	  ]
// 	},
// 	"blending": "overlay",
// 	"opacity": {
// 	  "center": 0.5,
// 	  "edge": 0.05
// 	},
// 	"skew": -2,
// 	"shapes": [
// 	  "s",
// 	  "t"
// 	]
//   });`