import { useEffect, useRef } from 'react';

export default function PdfViewerComponent(props) {
	const containerRef = useRef(null);

	useEffect(() => {
		const container = containerRef.current;
		let instance, PSPDFKit;
		(async function () {
			PSPDFKit = await import('pspdfkit');

			PSPDFKit.unload(container); // Ensure there's only one Nutrient instance.

			instance = await PSPDFKit.load({
				// Container where Nutrient should be mounted.
				container,
				// The document to open.
				document: props.document,
				// Use the public directory URL as a base URL. Nutrient will download its library assets from here.
				baseUrl: `${window.location.protocol}//${
					window.location.host
				}/${import.meta.env.BASE_URL}`,
			});
		})();

		return () => PSPDFKit && PSPDFKit.unload(container);
	}, []);

	return (
		<div
			ref={containerRef}
			style={{ width: '100%', height: '100vh' }}
		/>
	);
}