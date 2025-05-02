interface ConfettiOptions {
    quantity: number;
    maxSize: number;
    minSize: number;
    colorsArray: string[];
    velocity: number;
    infiniteLoop: boolean;
    minOpacity: number;
    maxOpacity: number;
}

interface ConfettiParticle {
    x: number;
    y: number;
    size: number;
    color: string;
    velocityX: number;
    velocityY: number;
    rotation: number;
    rotationSpeed: number;
    shape: number;
    depth: number;
}

export function generateConfetti(t: ConfettiOptions, o: string = "vanillaConfettiCanvas"): void {
    const e: HTMLCanvasElement | null = document.querySelector(`#${o}`);
    if (null === e) return void console.error(`Canvas with id "${o}" not found.`);
    const i: CanvasRenderingContext2D | null = e.getContext("2d");
    if (!i) return;

    const a: ConfettiParticle[] = [];

    function n(): void {
        e!.width = window.innerWidth;
        e!.height = window.innerHeight;
    }

    function r(t: ConfettiParticle): void {
        i!.save();
        i!.translate(t.x, t.y);
        i!.rotate((t.rotation * Math.PI) / 180);
        i!.scale(1, Math.cos((t.rotation * Math.PI) / 180));
        i!.fillStyle = t.color;
        if (t.shape === 0) {
            i!.fillRect(-t.size / 2, -t.size / 2, t.size, t.size);
        } else if (t.shape === 1) {
            i!.beginPath();
            i!.arc(0, 0, t.size / 2, 0, 2 * Math.PI);
            i!.fill();
        } else {
            i!.beginPath();
            i!.moveTo(-t.size / 2, t.size / 2);
            i!.lineTo(t.size / 2, t.size / 2);
            i!.lineTo(t.size / 4, -t.size / 2);
            i!.lineTo(-t.size / 4, -t.size / 2);
            i!.closePath();
            i!.fill();
        }
        i!.restore();
    }

    n();
    window.addEventListener("resize", n);

    (function (): void {
        for (let o = 0; o < t.quantity; o += 1) {
            a.push({
                x: Math.random() * e.width,
                y: Math.random() * e.height - e.height,
                size: Math.random() * (t.maxSize - t.minSize) + t.minSize,
                color: t.colorsArray[Math.floor(Math.random() * t.colorsArray.length)],
                velocityX: 2 * Math.random() - 1,
                velocityY: 3 * Math.random() + 2,
                rotation: 360 * Math.random(),
                rotationSpeed: 10 * Math.random() - 5,
                shape: Math.floor(3 * Math.random()),
                depth: 3 * Math.random(),
            });
        }
    })();

    (function o(): void {
        i.clearRect(0, 0, e.width, e.height);
        for (let o of a) {
            o.velocityY += t.velocity;
            o.x += 0.5 * Math.sin(o.y / 30);
            o.rotation += o.rotationSpeed;
            o.x += o.velocityX;
            o.y += o.velocityY;
            if (o.y > e.height) {
                if (t.infiniteLoop === true) {
                    o.y = -10;
                    o.x = Math.random() * e.width;
                    o.velocityY = 3 * Math.random() + 2;
                    o.size = Math.random() * (t.maxSize - t.minSize) + t.minSize;
                    o.color = t.colorsArray[Math.floor(Math.random() * t.colorsArray.length)];
                    o.depth = 3 * Math.random();
                    o.rotation = 360 * Math.random();
                } else {
                    a.splice(a.indexOf(o), 1);
                }
            }
            i.globalAlpha = (1 - o.depth / 3) * t.minOpacity + Math.random() * (t.maxOpacity - t.minOpacity);
            r(o);
        }
        i.globalAlpha = 1;
        requestAnimationFrame(o);
    })();
}