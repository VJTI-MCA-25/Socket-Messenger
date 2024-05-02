import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPlus } from "@fortawesome/free-solid-svg-icons";
import { animated } from "@react-spring/web";

const MinNav = ({ rainIcons, slideNav, minNavSlide, sidenavOptions, setActiveOption, styles, isNavOpen }) => {
	function handleClick(option) {
		if (!isNavOpen) slideNav();
		if (option) {
			setActiveOption(option);
		}
	}

	function populateSidenavOptions(options) {
		return options.map((option, index) => {
			return (
				<animated.li style={rainIcons[index + 1]} key={index}>
					<a
						className="waves-effect"
						onClick={() => handleClick(option.name)}
						onKeyDown={(e) => e.key === "Enter" && handleClick(option.name)}
						role="menuitem"
						tabIndex={0} // Make the link focusable
					>
						<FontAwesomeIcon icon={option.icon} className={`${option.iconClasses} ${styles.icon} icon`} />
					</a>
				</animated.li>
			);
		});
	}

	return (
		<animated.div style={minNavSlide} className={`${styles.sidenavMin} z-depth-1-half`} role="navigation">
			<animated.li style={rainIcons[0]}>
				<a
					className="waves-effect sidenav-trigger"
					onClick={slideNav}
					onKeyDown={(e) => e.key === "Enter" && slideNav()}
					role="menuitem"
					tabIndex={0} // Make the link focusable
				>
					<FontAwesomeIcon icon={faBars} className={`${styles.icon} bars-icon icon`} />
				</a>
			</animated.li>
			{populateSidenavOptions(sidenavOptions)}
			<animated.li
				style={rainIcons[rainIcons.length - 1]}
				onClick={() => handleClick()}
				role="menuitem"
				tabIndex={0}>
				<a className="waves-effect">
					<FontAwesomeIcon icon={faPlus} className={`${styles.icon} icon`} />
				</a>
			</animated.li>
		</animated.div>
	);
};

// PropTypes
MinNav.propTypes = {
	rainIcons: PropTypes.array.isRequired,
	slideNav: PropTypes.func.isRequired,
	minNavSlide: PropTypes.object.isRequired,
	sidenavOptions: PropTypes.array.isRequired,
	setActiveOption: PropTypes.func.isRequired,
};

export { MinNav };
