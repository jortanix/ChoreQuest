type SkeletonBlockProps = {
    width?: string
    height?: string
    rounded?: boolean
    circle?: boolean
    className?: string
}

export default function SkeletonBlock({
                                          width = '100%',
                                          height = '1rem',
                                          rounded = true,
                                          circle = false,
                                          className = '',
                                      }: SkeletonBlockProps) {
    return (
        <div
            className={[
                'skeleton-block',
                rounded ? 'is-rounded' : '',
                circle ? 'is-circle' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            aria-hidden="true"
            style={{ width, height }}
        />
    )
}