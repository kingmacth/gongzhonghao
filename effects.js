// effects.js - Simple Background Particle Effect

document.addEventListener('DOMContentLoaded', () => {
    const particleContainer = document.createElement('div');
    particleContainer.id = 'particle-background'; // 添加ID用于CSS样式
    document.body.appendChild(particleContainer);

    const numberOfParticles = 50; // 粒子数量，可以调整

    for (let i = 0; i < numberOfParticles; i++) {
        const particle = document.createElement('span');
        particle.classList.add('particle');

        // 随机设置粒子的初始位置、大小、透明度和动画延迟
        const size = Math.random() * 4 + 1; // 1px to 5px
        const duration = Math.random() * 20 + 10; // 10s to 30s animation duration
        const delay = Math.random() * 20; // 0s to 20s animation delay
        const startX = Math.random() * 100; // 0% to 100% from left
        const startY = Math.random() * 100; // 0% to 100% from top
        const opacity = Math.random() * 0.6 + 0.2; // 0.2 to 0.8 opacity

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;
        particle.style.opacity = opacity;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        particleContainer.appendChild(particle);
    }
});