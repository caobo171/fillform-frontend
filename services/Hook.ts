import { useRouter } from "next/router";
import { useEffect, useState } from "react";


const useQuery = () => (useRouter().query);


// Hook - Technical debt
const useWindowSize = () => {

	if (typeof window === "undefined") {
		return {
			width: 0,
			height: 0,
		};
	}
	
	// Initialize state with undefined width/height so server and client renders match
	// Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		// Handler to call on window resize
		function handleResize() {
			// Set window width/height to state
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight - 180,
			});
		}
		handleResize();
		// Add event listener
		window.addEventListener("resize", handleResize);

		// Remove event listener on cleanup
		return () => window.removeEventListener("resize", handleResize);
	}, []); // Empty array ensures that effect is only run on mount

	return windowSize;
}
export const Hook = {
	useWindowSize,
	useQuery
};