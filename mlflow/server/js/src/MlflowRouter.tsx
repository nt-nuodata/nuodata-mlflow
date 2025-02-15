import React, { useEffect, useMemo, useState } from 'react';
import { LegacySkeleton } from '@databricks/design-system';

import ErrorModal from './experiment-tracking/components/modals/ErrorModal';
import AppErrorBoundary from './common/components/error-boundaries/AppErrorBoundary';
import { HashRouter, Route, Routes, createLazyRouteElement } from './common/utils/RoutingUtils';
import { MlflowHeader } from './common/components/MlflowHeader';

// Route definition imports:
import { getRouteDefs as getExperimentTrackingRouteDefs } from './experiment-tracking/route-defs';
import { getRouteDefs as getModelRegistryRouteDefs } from './model-registry/route-defs';
import { getRouteDefs as getCommonRouteDefs } from './common/route-defs';
import { useInitializeExperimentRunColors } from './experiment-tracking/components/experiment-page/hooks/useExperimentRunColor';

/**
 * This is the MLflow default entry/landing route.
 */
const landingRoute = {
  path: '/',
  element: createLazyRouteElement(() => import('./experiment-tracking/components/HomePage')),
  pageId: 'mlflow.experiments.list',
};

export const MlflowRouter = ({
  isDarkTheme,
  setIsDarkTheme,
}: {
  isDarkTheme?: boolean;
  setIsDarkTheme?: (isDarkTheme: boolean) => void;
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useInitializeExperimentRunColors();

  const isInIframe = window.self !== window.top;
  const [isHeaderShow, setHeaderShow] = useState(!isInIframe);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const routes = useMemo(
    () => [...getExperimentTrackingRouteDefs(), ...getModelRegistryRouteDefs(), landingRoute, ...getCommonRouteDefs()],
    [],
  );

  useEffect(() => {
    if (!('authToken' in localStorage) && !window.location.hash.includes('sso-login')) {
      localStorage.setItem('loginPath', window.location.hash);
      window.location.href = '#/sso-login';
    }

    if (window.location.hash.includes('sso-login')) {
      setHeaderShow(false);
    }
  }, []);

  return (
    <>
      <ErrorModal />
      <HashRouter>
        <AppErrorBoundary>
          {isHeaderShow && <MlflowHeader isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme} />}
          <React.Suspense fallback={<LegacySkeleton />}>
            <Routes>
              {routes.map(({ element, pageId, path }) => (
                <Route key={pageId} path={path} element={element} />
              ))}
            </Routes>
          </React.Suspense>
        </AppErrorBoundary>
      </HashRouter>
    </>
  );
};
