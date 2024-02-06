import { animated } from "@react-spring/web";

import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPlus } from "@fortawesome/free-solid-svg-icons";

const MinNav = ({ rainIcons, slideNav, minNavSlide, sidenavOptions, setActiveOption }) => {
	function populateSidenavOptions(options) {
		return options.map((option, index) => {
			return (
				<animated.li style={rainIcons[index + 1]} key={index}>
					<a className="waves-effect" onClick={() => setActiveOption(option.name)}>
						<FontAwesomeIcon icon={option.icon} className={option.iconClasses + " icon"} />
					</a>
				</animated.li>
			);
		});
	}

	return (
		<animated.div style={{ zIndex: 999, ...minNavSlide }}>
			<div className="sidenav-min z-depth-2">
				<animated.li style={rainIcons[0]}>
					<a className="waves-effect">
						<FontAwesomeIcon icon={faBars} className="bars-icon icon" onClick={slideNav} />
					</a>
				</animated.li>
				{populateSidenavOptions(sidenavOptions)}
				<animated.li style={rainIcons[rainIcons.length - 1]} onClick={() => console.log("hello")}>
					<a className="waves-effect">
						<FontAwesomeIcon icon={faPlus} className="bars-icon icon" />
					</a>
				</animated.li>
			</div>
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
