import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useMemo, useState } from 'react';

type GalleryArgs = {
    size: number;
    showLabels: boolean;
};

type SvgAsset = {
    fileName: string;
    name: string;
    src: string;
};

type LoadedSvgAsset = SvgAsset & {
    markup: string;
};

type SvgDimensions = {
    width: number;
    height: number;
};

type WebpackRequireWithContext = NodeRequire & {
    context: (
        path: string,
        deep?: boolean,
        filter?: RegExp,
    ) => {
        keys: () => string[];
        <T = string | { default: string | { src: string } }>(id: string): T;
    };
};

const svgContext = (require as WebpackRequireWithContext).context('./', false, /\.svg$/);

const svgAssets: SvgAsset[] = svgContext
    .keys()
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
        const moduleValue = svgContext<string | { default: string | { src: string } }>(key);
        const src =
            typeof moduleValue === 'string'
                ? moduleValue
                : typeof moduleValue.default === 'string'
                  ? moduleValue.default
                  : moduleValue.default.src;

        return {
            fileName: key.replace('./', ''),
            src,
            name: formatIconName(key.replace('./', '')),
        };
    });

const meta: Meta<GalleryArgs> = {
    title: 'Design System/Icons',
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        size: 28,
        showLabels: true,
    },
    argTypes: {
        size: {
            control: { type: 'range', min: 16, max: 72, step: 2 },
        },
        showLabels: {
            control: 'boolean',
        },
    },
    render: (args: GalleryArgs) => <IconsGallery {...args} />,
};

export default meta;

type Story = StoryObj;

export const Gallery: Story = {};

function IconsGallery({ size, showLabels }: GalleryArgs) {
    const icons = useSvgAssets();

    const items = useMemo(
        () =>
            icons.map((icon) => ({
                ...icon,
                markup: resizeSvg(icon.markup, size),
            })),
        [icons, size],
    );

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top, #ffffff 0%, #ffffff 45%)',
                color: '#111111',
                padding: '32px 24px 48px',
                fontFamily: '"Pretendard Variable", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
            }}
        >
            <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Icon Gallery</h1>
                    <p
                        style={{
                            margin: '10px 0 0',
                            color: '#5f5648',
                            lineHeight: 1.6,
                            fontSize: 14,
                        }}
                    >
                        전체 SVG를 원본 상태 그대로 한 번에 확인하는 갤러리입니다. 크기만 조절하고,
                        색상과 fill/outline 상태는 각 SVG 원본 값을 그대로 유지합니다.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 24,
                    }}
                >
                    {items.map((icon) => (
                        <figure
                            key={icon.fileName}
                            style={{
                                margin: 0,
                                minHeight: 120,
                                borderRadius: 18,
                                padding: '18px 14px 16px',
                                background: 'rgba(255,255,255,0.78)',
                                boxShadow: '0 10px 30px rgba(78,64,40,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    minHeight: 56,
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                }}
                                dangerouslySetInnerHTML={{ __html: icon.markup }}
                            />
                            {showLabels ? (
                                <figcaption
                                    style={{
                                        fontSize: 13,
                                        lineHeight: 1.45,
                                        color: '#1f1a14',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {icon.name}
                                </figcaption>
                            ) : null}
                        </figure>
                    ))}
                </div>
            </div>
        </div>
    );
}

function useSvgAssets() {
    const [icons, setIcons] = useState<LoadedSvgAsset[]>([]);

    useEffect(() => {
        let cancelled = false;

        Promise.all(
            svgAssets.map(async (asset) => {
                const response = await fetch(asset.src);
                const markup = response.ok ? await response.text() : '';

                return {
                    ...asset,
                    markup,
                };
            }),
        ).then((nextIcons) => {
            if (!cancelled) {
                setIcons(nextIcons);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    return icons;
}

function resizeSvg(markup: string, size: number) {
    if (!markup || typeof window === 'undefined') {
        return markup;
    }

    const parser = new DOMParser();
    const documentNode = parser.parseFromString(markup, 'image/svg+xml');
    const rootElement = documentNode.documentElement;

    if (!(rootElement instanceof SVGSVGElement) || rootElement.tagName.toLowerCase() !== 'svg') {
        return markup;
    }

    const svg = rootElement;
    const dimensions = getSvgDimensions(svg);
    const scaled = scaleDimensions(dimensions, size);

    svg.setAttribute('width', String(scaled.width));
    svg.setAttribute('height', String(scaled.height));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    return new XMLSerializer().serializeToString(svg);
}

function getSvgDimensions(svg: SVGSVGElement): SvgDimensions {
    const viewBox = svg.getAttribute('viewBox');

    if (viewBox) {
        const [, , width, height] = viewBox
            .split(/[\s,]+/)
            .map((value) => Number.parseFloat(value));

        if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
            return { width, height };
        }
    }

    const width = Number.parseFloat(svg.getAttribute('width') ?? '24');
    const height = Number.parseFloat(svg.getAttribute('height') ?? '24');

    return {
        width: Number.isFinite(width) && width > 0 ? width : 24,
        height: Number.isFinite(height) && height > 0 ? height : 24,
    };
}

function scaleDimensions(dimensions: SvgDimensions, targetSize: number) {
    const longestEdge = Math.max(dimensions.width, dimensions.height);
    const ratio = targetSize / longestEdge;

    return {
        width: Math.round(dimensions.width * ratio),
        height: Math.round(dimensions.height * ratio),
    };
}

function formatIconName(fileName: string) {
    return fileName
        .replace(/\.svg$/i, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
