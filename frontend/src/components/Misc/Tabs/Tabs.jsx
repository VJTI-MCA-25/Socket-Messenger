import { useState, useRef } from "react";
import styles from "./Tabs.module.scss";

const Tabs = ({ list, tabsPosition = "bottom" }) => {
	const [activeTab, setActiveTab] = useState(0);
	const tabRefs = useRef([]);

	if (!list || list.length === 0) return null;

	function tabsPositionStyle() {
		if (tabsPosition === "top") {
			return {
				flexDirection: "column",
			};
		} else if (tabsPosition === "bottom") {
			return {
				flexDirection: "column-reverse",
			};
		}
	}

	function handleTabChange(prev, next, e) {
		if (prev === next) return;
		setActiveTab(next);
	}

	return (
		<div className={styles.container} style={tabsPositionStyle()}>
			<div className={styles.tabs}>
				{list.map((item, index) => (
					<li
						key={index}
						onClick={(e) => handleTabChange(activeTab, index, e)}
						className={`${styles.tab} ${index === activeTab ? styles.active : ""}`}
						ref={(el) => (tabRefs.current[index] = el)}>
						{item.tab}
					</li>
				))}
			</div>
			<div className={styles.panel}>{list[activeTab]?.panel}</div>
		</div>
	);
};

export { Tabs };
