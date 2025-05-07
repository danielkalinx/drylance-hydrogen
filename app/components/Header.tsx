import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from '@remix-run/react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Button} from '~/components/ui/button';
import {useMediaQuery} from '~/utils/useMediaQuery';
import {Drawer, DrawerTrigger, DrawerContent} from '~/components/ui/drawer';
import {Sheet, SheetTrigger, SheetContent} from '~/components/ui/sheet';
import {useEffect, useState} from 'react';
import {Iconlyuser} from '~/components/icons/Iconlyuser';
import {IconlyShoppingCart} from '~/components/icons/IconlyShoppingCart';
import Logo from '~/assets/logo/drylance-small.svg';
import {IconlyHamburgermenu} from './icons/IconlyHamburgermenu';
import {DotLottie} from './DotLottie';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

// main header
export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        <img src={Logo} alt="Drylance Logo" className="h-9 w-9" />
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

// nav menu
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

// CTAs (studio, account, cart)
function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const isMdUp = useMediaQuery('(min-width: 768px)'); // Tailwind's md breakpoint
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close modal on route change
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Unified button click handler
  const handleOpen = () => setOpen(true);

  // Hide button on /studio routes
  const isStudioRoute = location.pathname.startsWith('/studio');

  return (
    <nav
      className="header-ctas"
      role="navigation"
      style={{display: 'flex', alignItems: 'center', gap: 8}}
    >
      <ConfigureTowelButton />
      <NavLink
        prefetch="intent"
        to="/account"
        aria-label="Account"
        style={{padding: 0, display: 'flex', alignItems: 'center'}}
      >
        <Button variant="outline" size="sm" asChild>
          <span>
            <Iconlyuser size={24} />
          </span>
        </Button>
      </NavLink>
      <CartToggle cart={cart} />
      <HeaderMenuMobileToggle />
    </nav>
  );
}

// Configure Towel Button
function ConfigureTowelButton() {
  return (
    <Button variant="outline" size="sm">
      Start now
      <DotLottie url={'/lottie/right.lottie'} width={24} height={24} />
    </Button>
  );
}

// mobile menu toggle
function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label="Menu"
      onClick={() => open('mobile')}
    >
      <IconlyHamburgermenu />
    </Button>
  );
}

// cart icon + badge
function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label="Cart"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <IconlyShoppingCart size={24} />
      {count !== null && count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            background: '#d00',
            color: '#fff',
            borderRadius: '50%',
            fontSize: 10,
            minWidth: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            padding: '0 4px',
            lineHeight: 1,
          }}
        >
          {count}
        </span>
      )}
    </Button>
  );
}

// suspense cart badge
function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

// cart badge logic
function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

// nav link style
function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
