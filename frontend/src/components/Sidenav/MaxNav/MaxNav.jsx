import { animated } from "@react-spring/web";

import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const MaxNav = ({ maxNavSlide, activeOptionsList, isNavOpen, slideNav }) => {
	function handleClick(func) {
		return () => {
			func ? func() : null;
		};
	}

	function populateSidenav() {
		return activeOptionsList((style, option) => {
			return (
				<animated.li style={style} key={option.name}>
					<Link to={option.to} className="waves-effect" onClick={handleClick(option.onClick)}>
						<FontAwesomeIcon icon={option.icon} className={option.classes + " sidenav-icon"} />
						{option.text}
					</Link>
				</animated.li>
			);
		});
	}

	return (
		<animated.div style={maxNavSlide} className="z-depth-1 sidenav sidenav-fixed sidenav-max">
			<ul>{populateSidenav()}</ul>
		</animated.div>
	);
};

// PropTypes
MaxNav.propTypes = {
	maxNavSlide: PropTypes.object.isRequired,
	activeOption: PropTypes.string.isRequired,
	activeOptionsList: PropTypes.func.isRequired,
	isNavOpen: PropTypes.bool.isRequired,
	slideNav: PropTypes.func.isRequired,
};

export { MaxNav };
