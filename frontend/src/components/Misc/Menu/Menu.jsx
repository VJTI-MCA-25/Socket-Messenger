import { forwardRef } from "react";
import { useTransition, animated } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Menu.module.scss";

/**
 * Menu component that displays a list of options.
 *
 * @component
 * @param {Object[]} options - An array of objects representing the menu options.
 * @param {string} options[].text - The text to display for the menu option.
 * @param {FontAwesomeIconProps} options[].icon - The icon to display for the menu option.
 * @param {function} options[].onClick - The function to be called when the menu option is clicked.
 *
 * The Menu Component styles are modularized using SASS/SCSS modules.
 * The positioning of the menu should be handled by the component that uses it.
 *
 * @returns {JSX.Element} The rendered Menu component.
 */
const Menu = forwardRef(({ options, showMenu, friend }, ref) => {
	const menuAnim = useTransition(showMenu, {
		from: { opacity: 0, transform: "scale(0)" },
		enter: { opacity: 1, transform: "scale(1)" },
		leave: { opacity: 0, transform: "scale(0)" },
		config: { tension: 300, friction: 20 },
	});

	return menuAnim(
		(anim, item) =>
			item && (
				<animated.div ref={ref} style={anim} className={styles.container}>
					<ul className={styles.menu}>
						{options.map((option, index) => {
							let { text, icon, clickFn } = option;
							return (
								<animated.li
									key={index}
									onMouseDown={() => clickFn(friend)}
									className={styles.menuItem}>
									<div className={styles.text}>{text}</div>
									<div className={styles.icon}>
										<FontAwesomeIcon icon={icon} />
									</div>
								</animated.li>
							);
						})}
					</ul>
				</animated.div>
			)
	);
});

export { Menu };
