#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "Gt4FlutterPlugin.h"

FOUNDATION_EXPORT double gt4_flutter_pluginVersionNumber;
FOUNDATION_EXPORT const unsigned char gt4_flutter_pluginVersionString[];

