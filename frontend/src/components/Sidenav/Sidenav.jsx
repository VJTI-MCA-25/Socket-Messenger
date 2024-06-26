import { useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSpring, useTrail, useSpringRef, useChain, useTransition } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

import { MaxNav } from "./MaxNav/MaxNav";
import { MinNav } from "./MinNav/MinNav";

import { minSidenavOptions as minNavOptions, maxSidenavOptions as maxNavOptions } from "./sidenavOptions";

import styles from "./Sidenav.module.scss";

const Sidenav = ({ isNavOpen, setIsNavOpen, groupDetails }) => {
	const [activeOption, setActiveOption] = useState("messages");
	const [activeOptionsList, setActiveOptionsList] = useState(maxNavOptions[activeOption]);

	useLayoutEffect(() => {
		setActiveOptionsList(maxNavOptions[activeOption]);
	}, [activeOption]);

	// Animation - Fade in active options list (MaxNav)
	const activeOptionsListRef = useSpringRef();
	const activeOptionsListAnim = useTransition(activeOptionsList, {
		from: { opacity: 0, y: -5 },
		enter: { opacity: 1, y: 0 },
		trail: 150 / activeOptionsList.length,
		// reset: true,
		config: { duration: 150 },
		ref: activeOptionsListRef,
	});

	// Animation - Fade in icons (on render)
	const rainIconsRef = useSpringRef();
	const rainIcons = useTrail(minNavOptions.length + 2, {
		ref: rainIconsRef,
		from: { opacity: 0, y: -20 },
		to: { opacity: 1, y: 0 },
	});

	// Animation - Slide in nav, for min nav (on click)
	const minNavSlideRef = useSpringRef();
	const minNavSlide = useSpring({
		ref: minNavSlideRef,
		from: { x: "-100%" },
		to: { x: "0%" },
	});

	// Animation - Slide in nav, for max nav (on click)
	const maxNavSlideRef = useSpringRef();
	const [maxNavSlide, maxNavSlideApi] = useSpring(() => ({
		ref: maxNavSlideRef,
		from: { x: "-150%" },
		to: { x: "0%" },
	}));

	// Animation - Drag nav
	const bind = useDrag(({ down, movement: [mx] }) => {
		mx = (mx / window.innerWidth) * 500;
		const clampedX = Math.max(Math.min(mx, 0), -150);
		maxNavSlideApi.start({
			x: down ? `${clampedX}%` : clampedX < -75 ? "-150%" : "0%",
			immediate: down,
			config: { tension: 500, friction: 50 },
			clamp: true,
			touchAction: "none",
			onRest: () => {
				if (!down && clampedX < -75) {
					setIsNavOpen(false);
				}
			},
		});
	});

	function slideNav() {
		if (!isNavOpen) setIsNavOpen(true);
		maxNavSlideApi.start({
			to: { x: isNavOpen ? "-150%" : "0%" },
			onRest: () => {
				if (isNavOpen) setIsNavOpen(false);
			},
		});
	}

	useChain([minNavSlideRef, rainIconsRef, maxNavSlideRef, activeOptionsListRef], [0.2, 0.5, 0.8, 0.25], 500);

	return (
		<div className={`${styles.sidenavContainer} ${isNavOpen ? "open" : "close"}`}>
			<MinNav
				rainIcons={rainIcons}
				slideNav={slideNav}
				minNavSlide={minNavSlide}
				sidenavOptions={minNavOptions}
				setActiveOption={setActiveOption}
				styles={styles}
				isNavOpen={isNavOpen}
			/>
			<MaxNav
				maxNavSlide={maxNavSlide}
				activeOption={activeOption}
				activeOptionsList={activeOptionsListAnim}
				isNavOpen={isNavOpen}
				slideNav={slideNav}
				bind={bind}
				styles={styles}
				groups={groupDetails}
			/>
		</div>
	);
};

// PropTypes
Sidenav.propTypes = {
	isNavOpen: PropTypes.bool.isRequired,
	setIsNavOpen: PropTypes.func.isRequired,
};

export { Sidenav };
