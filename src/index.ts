/**
 * EquiSafe Packages Template
 * A base template for creating TypeScript packages
 */

/**
 * Example function that returns a greeting message
 * @param name - The name to greet
 * @returns A greeting message
 */
export function greet(name: string): string {
  return `Hello, ${name}! Welcome to EquiSafe packages.`;
}

/**
 * Version information
 */
export const version = '1.0.0';

/**
 * Package information
 */
export const packageInfo = {
  name: 'packages-templates',
  description: 'Template for creating TypeScript packages',
  author: 'EquiSafe Team'
};
