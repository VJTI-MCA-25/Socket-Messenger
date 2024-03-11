import { useContext } from "react";
import { Link } from "react-router-dom";

import { animated } from "@react-spring/web";

import { UserDataContext } from "contexts/UserDataContext";

import officeImage from "assets/office.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PropTypes from "prop-types";

const MaxNav = ({ maxNavSlide, activeOptionsList, bind }) => {
	const userData = useContext(UserDataContext);

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
		<animated.div
			{...bind()}
			style={{ ...maxNavSlide, touchAction: "none" }}
			className="z-depth-1 sidenav sidenav-fixed sidenav-max">
			<ul>
				<li>
					<div className="user-view">
						<div className="background">
							<img src={officeImage} />
						</div>
						<img className="circle" src="https://via.placeholder.com/150" />
						<span className="white-text name">{userData?.displayName}</span>
						<span className="white-text email">{userData?.email}</span>
					</div>
				</li>
				{populateSidenav()}
			</ul>
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
