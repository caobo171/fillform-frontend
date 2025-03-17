import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Hook that alerts clicks outside of the passed ref
 */
const useOutsideAlerter = (ref: any, handle: Function) => {
	useEffect(() => {
		/**
		 * Alert if clicked on outside of element
		 */
		const handleClickOutside = (event: any) => {
			if (ref.current && !ref.current.contains(event.target)) {
				if (handle) {
					handle();
				}
			}
		}
		// Bind the event listener
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [ref]);
}

/**
 * Component that alerts if you click outside of it
 */

interface Props {
	handle: Function,
	[key: string]: any
}
const OutsideClickDetect = (props: Props) => {
	const wrapperRef = useRef(null);
	useOutsideAlerter(wrapperRef, props.handle);

	return <div {...props} ref={wrapperRef} />;
}

export default OutsideClickDetect;